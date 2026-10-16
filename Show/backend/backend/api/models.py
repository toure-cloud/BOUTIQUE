# api/models.py
import re
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import is_password_usable
from django.core.validators import (
    MinValueValidator, MaxValueValidator, RegexValidator,
    MinLengthValidator, MaxLengthValidator,
)
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, F


# =============================================
# ✅ VALIDATEURS RÉUTILISABLES
# =============================================

phone_validator = RegexValidator(
    regex=r'^0\d{9}$',
    message="Le téléphone doit contenir 10 chiffres commençant par 0.",
)

name_validator = RegexValidator(
    regex=r"^[a-zA-ZÀ-ÿ\s\-']{2,100}$",
    message="Ce champ ne doit contenir que des lettres (2 à 100 caractères).",
)

code_promo_validator = RegexValidator(
    regex=r'^[A-Z0-9_\-]{3,50}$',
    message="Le code ne doit contenir que des majuscules, chiffres, - et _ (3 à 50 caractères).",
)


def valider_email_format(value):
    """Validation email basique (Django valide déjà via EmailField)."""
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError as DjangoValidationError
    try:
        validate_email(value)
    except DjangoValidationError:
        raise ValidationError("Format d'email invalide.")


def valider_telephone_chiffres(value):
    """Nettoie et valide un téléphone."""
    if not value:
        return ''
    chiffres = re.sub(r'\D', '', str(value))
    if len(chiffres) < 8 or len(chiffres) > 15:
        raise ValidationError("Le téléphone doit contenir entre 8 et 15 chiffres.")
    return chiffres


# =============================================
# ✅ AUTHENTIFICATION & UTILISATEURS
# =============================================

class Client(models.Model):
    """Modèle pour les clients (avec authentification par mot de passe)"""
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, blank=True,
        related_name='client_profile'
    )
    nom = models.CharField(
        max_length=100,
        validators=[name_validator, MinLengthValidator(2)],
    )
    prenom = models.CharField(
        max_length=100,
        validators=[name_validator, MinLengthValidator(2)],
    )
    email = models.EmailField(unique=True, validators=[MaxLengthValidator(254)])
    telephone = models.CharField(max_length=20, validators=[phone_validator])
    adresse = models.TextField(blank=True, max_length=500)
    password = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    api_token = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        db_index=True,
        help_text="Token d'authentification API pour le client.",
    )
    api_token_active = models.BooleanField(default=False)

    def set_password(self, raw_password):
        """Hache et enregistre le mot de passe."""
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password)
        self.save(update_fields=['password'])

    def check_password(self, raw_password):
        """Vérifie si le mot de passe est correct."""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)

    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.strip().lower()
        if self.telephone:
            self.telephone = valider_telephone_chiffres(self.telephone)

        # ✅ Empêche l'écrasement du hash password via API
        if self.pk:
            old = Client.objects.filter(pk=self.pk).values('password').first()
            if old and old['password']:
                # Si le password a changé ET n'est pas un hash valide → refus
                if self.password != old['password'] and not is_password_usable(self.password):
                    raise ValidationError({
                        'password': "Utilisez set_password() pour modifier le mot de passe."
                    })

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        if self.telephone:
            self.telephone = valider_telephone_chiffres(self.telephone)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['telephone']),
            models.Index(fields=['api_token']),
        ]


# =============================================
# ✅ COACH & FORFAITS
# =============================================

class Coach(models.Model):
    """Modèle pour le coach (Madame T)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100, validators=[name_validator])
    prenom = models.CharField(max_length=100, validators=[name_validator])
    bio = models.TextField(max_length=2000, blank=True)
    photo = models.ImageField(upload_to='coach/', null=True, blank=True)
    email = models.EmailField()
    telephone = models.CharField(max_length=20, validators=[phone_validator])
    specialites = models.TextField(max_length=1000, blank=True)
    experience = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(80)],
        help_text="Années d'expérience",
    )
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    class Meta:
        verbose_name = "Coach"
        verbose_name_plural = "Coachs"


class Forfait(models.Model):
    """Modèle pour les forfaits de coaching"""
    TYPE_CHOICES = [
        ('DEBUTANT', 'Débutant'),
        ('INTERMEDIAIRE', 'Intermédiaire'),
        ('AVANCE', 'Avancé'),
        ('PREMIUM', 'Premium'),
    ]

    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(max_length=2000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    duree = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(3650)],
        help_text="Durée en jours",
    )
    nb_seances = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(500)],
        help_text="Nombre de séances",
    )
    caracteristiques = models.JSONField(default=list)
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"

    class Meta:
        verbose_name = "Forfait"
        verbose_name_plural = "Forfaits"
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(check=Q(prix__gte=0), name='forfait_prix_positif'),
            models.CheckConstraint(check=Q(duree__gt=0), name='forfait_duree_positive'),
            models.CheckConstraint(check=Q(nb_seances__gt=0), name='forfait_nb_seances_positif'),
        ]


# =============================================
# ✅ ÉVÉNEMENTS & PARTICIPATIONS
# =============================================

class Evenement(models.Model):
    """Modèle pour les événements"""
    STATUT_CHOICES = [
        ('A_VENIR', 'À venir'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ANNULE', 'Annulé'),
    ]

    titre = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(3), MaxLengthValidator(200)],
    )
    theme = models.CharField(max_length=200, blank=True)
    description = models.TextField(max_length=5000)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    lieu = models.CharField(max_length=200, validators=[MinLengthValidator(2)])
    places_total = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100000)]
    )
    places_restantes = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    prix = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    image = models.ImageField(upload_to='evenements/', null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='A_VENIR')
    est_gratuit = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.date_debut and self.date_fin and self.date_fin < self.date_debut:
            raise ValidationError({
                'date_fin': "La date de fin doit être postérieure à la date de début."
            })
        if self.places_restantes > self.places_total:
            raise ValidationError({
                'places_restantes': "Les places restantes ne peuvent pas dépasser les places totales."
            })

        # ✅ Recalcule automatique si places_total modifié
        if self.pk:
            old = Evenement.objects.filter(pk=self.pk).values('places_total').first()
            if old and old['places_total'] != self.places_total:
                delta = self.places_total - old['places_total']
                self.places_restantes = max(0, (self.places_restantes or 0) + delta)

    def save(self, *args, **kwargs):
        # ✅ Initialiser places_restantes uniquement à la création
        if not self.pk and not self.places_restantes:
            self.places_restantes = self.places_total
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titre} - {self.date_debut}"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    @property
    def est_complet(self):
        return self.places_restantes <= 0

    class Meta:
        verbose_name = "Événement"
        verbose_name_plural = "Événements"
        ordering = ['-date_debut']
        constraints = [
            models.CheckConstraint(
                check=Q(places_total__gte=1),
                name='evenement_places_total_positif'
            ),
            models.CheckConstraint(
                check=Q(places_restantes__gte=0),
                name='evenement_places_restantes_positif'
            ),
            models.CheckConstraint(
                check=Q(prix__gte=0),
                name='evenement_prix_positif'
            ),
        ]
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['date_debut']),
        ]


class ParticipationEvenement(models.Model):
    """Modèle pour les participations aux événements"""
    STATUT_CHOICES = [
        ('INSCRIT', 'Inscrit'),
        ('PRESENT', 'Présent'),
        ('ABSENT', 'Absent'),
        ('ANNULE', 'Annulé'),
    ]

    evenement = models.ForeignKey(Evenement, on_delete=models.CASCADE, related_name='participations')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='participations_evenements')
    date_inscription = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='INSCRIT')
    notes = models.TextField(blank=True, max_length=500)

    def __str__(self):
        return f"{self.client} - {self.evenement}"

    class Meta:
        unique_together = ['evenement', 'client']
        verbose_name = "Participation événement"
        verbose_name_plural = "Participations événements"
        indexes = [
            models.Index(fields=['statut']),
        ]


# =============================================
# ✅ PRODUITS & BOUTIQUE
# =============================================

class Produit(models.Model):
    """Modèle pour les produits de la boutique"""
    CATEGORIE_CHOICES = [
        ('robes', 'Robes'),
        ('accessoires', 'Accessoires'),
        ('chaussures', 'Chaussures'),
        ('bijoux', 'Bijoux'),
        ('sacs', 'Sacs'),
        ('AUTRE', 'Autre'),
    ]

    nom = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(2), MaxLengthValidator(200)],
    )
    description = models.TextField(max_length=5000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES)
    image_principale = models.ImageField(upload_to='produits/')
    taille = models.CharField(max_length=20, blank=True)
    quantite_stock = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100000)]
    )
    est_disponible = models.BooleanField(default=True)
    est_en_promotion = models.BooleanField(default=False)
    prix_promotion = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
    )
    note = models.DecimalField(
        max_digits=3, decimal_places=1, default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    nb_avis = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    model_3d_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.prix_promotion is not None and self.prix is not None:
            if self.prix_promotion >= self.prix:
                raise ValidationError({
                    'prix_promotion': "Le prix promotionnel doit être inférieur au prix normal."
                })

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"

    @property
    def prix_actuel(self):
        if self.est_en_promotion and self.prix_promotion:
            return self.prix_promotion
        return self.prix

    @property
    def prix_formate(self):
        return f"{int(self.prix_actuel)} CFA"

    @property
    def image_url(self):
        if self.image_principale:
            return self.image_principale.url
        return None

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(check=Q(prix__gte=0), name='produit_prix_positif'),
            models.CheckConstraint(
                check=Q(quantite_stock__gte=0),
                name='produit_stock_positif'
            ),
            models.CheckConstraint(
                check=Q(note__gte=0) & Q(note__lte=5),
                name='produit_note_entre_0_et_5'
            ),
        ]


class ImageProduit(models.Model):
    """Modèle pour les images secondaires d'un produit"""
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images_secondaires')
    image = models.ImageField(upload_to='produits/secondaires/')
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.produit.nom} - Image {self.ordre}"

    class Meta:
        verbose_name = "Image secondaire"
        verbose_name_plural = "Images secondaires"
        ordering = ['ordre']


class AvisProduit(models.Model):
    """Modèle pour les avis sur les produits"""
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis')
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    note = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    commentaire = models.TextField(max_length=1000)
    date_creation = models.DateTimeField(auto_now_add=True)
    est_approuve = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.client} - {self.produit} - {self.note} étoiles"

    class Meta:
        verbose_name = "Avis produit"
        verbose_name_plural = "Avis produits"
        ordering = ['-date_creation']
        unique_together = ['produit', 'client']
        constraints = [
            models.CheckConstraint(
                check=Q(note__gte=1) & Q(note__lte=5),
                name='avis_note_entre_1_et_5'
            ),
        ]


# =============================================
# ✅ PANIER & COMMANDES
# =============================================

class Panier(models.Model):
    """Modèle pour le panier d'achat"""
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='paniers')
    date_creation = models.DateTimeField(auto_now_add=True)
    est_valide = models.BooleanField(default=False)

    def __str__(self):
        return f"Panier de {self.client}"

    class Meta:
        verbose_name = "Panier"
        verbose_name_plural = "Paniers"


class LignePanier(models.Model):
    """Modèle pour les lignes du panier"""
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    prix_unitaire = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.produit} x {self.quantite}"

    class Meta:
        verbose_name = "Ligne panier"
        verbose_name_plural = "Lignes panier"
        constraints = [
            models.CheckConstraint(check=Q(quantite__gte=1), name='ligne_panier_quantite_min'),
            models.CheckConstraint(check=Q(prix_unitaire__gte=0), name='ligne_panier_prix_positif'),
        ]


class Commande(models.Model):
    """Modèle pour les commandes"""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de paiement'),
        ('PAYEE', 'Payée'),
        ('EN_PREPARATION', 'En préparation'),
        ('EXPEDIEE', 'Expédiée'),
        ('LIVREE', 'Livrée'),
        ('ANNULEE', 'Annulée'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    total = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    adresse_livraison = models.TextField(
        max_length=500,
        validators=[MinLengthValidator(5)],
    )
    ville = models.CharField(max_length=100, blank=True, validators=[MaxLengthValidator(100)])
    code_postal = models.CharField(
        max_length=10, blank=True,
        validators=[RegexValidator(r'^\d{4,10}$', "Le code postal doit contenir 4 à 10 chiffres.")],
    )
    telephone = models.CharField(max_length=20, blank=True, validators=[phone_validator])
    notes = models.TextField(blank=True, max_length=1000)

    def __str__(self):
        return f"Commande #{self.id} - {self.client}"

    class Meta:
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        ordering = ['-date_commande']
        constraints = [
            models.CheckConstraint(check=Q(total__gte=0), name='commande_total_positif'),
        ]


class LigneCommande(models.Model):
    """Modèle pour les lignes de commande"""
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    prix_unitaire = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.produit} x {self.quantite}"

    class Meta:
        verbose_name = "Ligne commande"
        verbose_name_plural = "Lignes commande"


# =============================================
# ✅ RELOOKING & ATELIERS
# =============================================

class RubriqueRelookingFemme(models.Model):
    """Modèle pour les rubriques de relooking femme"""
    CATEGORIE_CHOICES = [
        ('COMPLET', 'Complet'),
        ('VISAGE', 'Visage'),
        ('VESTIMENTAIRE', 'Vestimentaire'),
        ('COIFFURE', 'Coiffure'),
        ('MAQUILLAGE', 'Maquillage'),
        ('SHOPPING', 'Personnel Shopping'),
        ('COLORIMETRIE', 'Analyse Colorimétrie'),
    ]

    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField(max_length=2000)
    description_detail = models.TextField(blank=True, max_length=5000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    duree = models.CharField(max_length=50)
    image = models.ImageField(upload_to='relooking_femme/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    note = models.DecimalField(
        max_digits=3, decimal_places=1, default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    nb_avis = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"

    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    class Meta:
        verbose_name = "Rubrique Relooking Femme"
        verbose_name_plural = "Rubriques Relooking Femme"
        ordering = ['ordre', 'nom']
        constraints = [
            models.CheckConstraint(check=Q(prix__gte=0), name='rubrique_femme_prix_positif'),
        ]


class RubriqueRelookingHomme(models.Model):
    """Modèle pour les rubriques de relooking homme"""
    CATEGORIE_CHOICES = [
        ('COACHING', 'Coaching Relooking'),
        ('BILAN', "Bilan d'Image"),
        ('SUBLIME', 'Relooking Sublime'),
        ('VINTAGE', 'Relooking Vintage'),
    ]

    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField(max_length=2000)
    description_detail = models.TextField(blank=True, max_length=5000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    duree = models.CharField(max_length=50)
    image = models.ImageField(upload_to='relooking_homme/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    note = models.DecimalField(
        max_digits=3, decimal_places=1, default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    nb_avis = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"

    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    class Meta:
        verbose_name = "Rubrique Relooking Homme"
        verbose_name_plural = "Rubriques Relooking Homme"
        ordering = ['ordre', 'nom']
        constraints = [
            models.CheckConstraint(check=Q(prix__gte=0), name='rubrique_homme_prix_positif'),
        ]


class RubriqueAtelier(models.Model):
    """Modèle pour les ateliers de relooking en groupe (2 à 6 personnes)"""
    CATEGORIE_CHOICES = [
        ('STYLE', 'Atelier Style et Élégance'),
        ('GROUPE', 'Atelier Relooking de Groupe'),
        ('MASTERCLASS', 'Masterclass Image et Confiance'),
    ]

    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField(max_length=2000)
    description_detail = models.TextField(blank=True, max_length=5000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    duree = models.CharField(max_length=50)
    nb_personnes_min = models.IntegerField(
        default=2,
        validators=[MinValueValidator(2), MaxValueValidator(100)],
    )
    nb_personnes_max = models.IntegerField(
        default=6,
        validators=[MinValueValidator(2), MaxValueValidator(100)],
    )
    image = models.ImageField(upload_to='ateliers/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    note = models.DecimalField(
        max_digits=3, decimal_places=1, default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    nb_avis = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.nb_personnes_min and self.nb_personnes_max:
            if self.nb_personnes_min > self.nb_personnes_max:
                raise ValidationError({
                    'nb_personnes_max': "Le maximum doit être supérieur ou égal au minimum."
                })

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"

    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"

    @property
    def places_display(self):
        return f"{self.nb_personnes_min} - {self.nb_personnes_max} personnes"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    class Meta:
        verbose_name = "Atelier Relooking en Groupe"
        verbose_name_plural = "Ateliers Relooking en Groupe"
        ordering = ['ordre', 'nom']
        constraints = [
            models.CheckConstraint(
                check=Q(nb_personnes_min__lte=F('nb_personnes_max')),
                name='atelier_min_lte_max'
            ),
        ]


# =============================================
# ✅ FORMATIONS EN LIGNE & INSCRIPTIONS
# =============================================

class FormationEnLigne(models.Model):
    """Modèle pour les formations en ligne (Elegance Times online)"""
    STATUT_CHOICES = [
        ('PROGRAMME', 'Programmé'),
        ('LIVE', 'En direct'),
        ('REPLAY', 'Replay disponible'),
        ('TERMINE', 'Terminé'),
    ]

    titre = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(3), MaxLengthValidator(200)],
    )
    description = models.TextField(max_length=5000)
    description_detail = models.TextField(blank=True, max_length=10000)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    duree = models.CharField(max_length=50)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='PROGRAMME')
    date_live = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to='formations/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)
    replay_url = models.URLField(blank=True, null=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titre} - {self.get_statut_display()}"

    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"

    @property
    def est_live(self):
        return self.statut == 'LIVE'

    @property
    def est_replay(self):
        return self.statut == 'REPLAY'

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    class Meta:
        verbose_name = "Formation en ligne"
        verbose_name_plural = "Formations en ligne"
        ordering = ['ordre', 'date_live']
        constraints = [
            models.CheckConstraint(check=Q(prix__gte=0), name='formation_prix_positif'),
        ]


class CodeAccesFormation(models.Model):
    """Modèle pour les codes d'accès aux formations"""
    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('UTILISE', 'Utilisé'),
        ('EXPIRE', 'Expiré'),
    ]

    formation = models.ForeignKey(FormationEnLigne, on_delete=models.CASCADE, related_name='codes')
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    code = models.CharField(max_length=20, unique=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ACTIF')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_utilisation = models.DateTimeField(null=True, blank=True)
    date_expiration = models.DateTimeField()
    montant_paye = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    reference_paiement = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.code} - {self.formation.titre} - {self.get_statut_display()}"

    @property
    def est_valide(self):
        return self.statut == 'ACTIF' and self.date_expiration > timezone.now()

    @property
    def est_utilisable(self):
        return self.est_valide and self.date_utilisation is None

    class Meta:
        verbose_name = "Code d'accès"
        verbose_name_plural = "Codes d'accès"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['statut']),
        ]


class InscriptionFormation(models.Model):
    """Modèle pour les inscriptions aux formations"""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de paiement'),
        ('PAYEE', 'Payée'),
        ('ANNULEE', 'Annulée'),
        ('REMBOURSEE', 'Remboursée'),
    ]

    formation = models.ForeignKey(FormationEnLigne, on_delete=models.CASCADE, related_name='inscriptions')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='inscriptions_formations')
    code_acces = models.OneToOneField(
        CodeAccesFormation, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='inscription',
    )
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_inscription = models.DateTimeField(auto_now_add=True)
    montant = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    reference_paiement = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True, max_length=500)

    def __str__(self):
        return f"{self.client} - {self.formation.titre}"

    class Meta:
        verbose_name = "Inscription formation"
        verbose_name_plural = "Inscriptions formations"
        ordering = ['-date_inscription']
        unique_together = ['formation', 'client']
        indexes = [
            models.Index(fields=['statut']),
        ]


# =============================================
# ✅ PAIEMENTS & TRANSACTIONS
# =============================================

class MoyenPaiement(models.Model):
    """Modèle pour les moyens de paiement disponibles"""
    TYPE_CHOICES = [
        ('WAVE', 'Wave'),
        ('ORANGE_MONEY', 'Orange Money'),
        ('MOOV_MONEY', 'Moov Money'),
        ('MTN_MONEY', 'MTN Mobile Money'),
        ('CARTE_BANCAIRE', 'Carte Bancaire'),
    ]

    nom = models.CharField(max_length=50, validators=[MinLengthValidator(2)])
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    logo = models.ImageField(upload_to='paiement/', null=True, blank=True)
    description = models.TextField(blank=True, max_length=500)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

    @property
    def logo_url(self):
        if self.logo:
            return self.logo.url
        return None

    class Meta:
        verbose_name = "Moyen de paiement"
        verbose_name_plural = "Moyens de paiement"
        ordering = ['ordre']


class TransactionPaiement(models.Model):
    """Modèle pour les transactions de paiement"""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('REUSSI', 'Réussi'),
        ('ECHOUE', 'Échoué'),
        ('ANNULE', 'Annulé'),
        ('REMBOURSE', 'Remboursé'),
    ]

    inscription = models.ForeignKey(InscriptionFormation, on_delete=models.CASCADE, related_name='transactions')
    moyen_paiement = models.ForeignKey(MoyenPaiement, on_delete=models.SET_NULL, null=True)
    montant = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    reference = models.CharField(max_length=100, unique=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    numero_transaction = models.CharField(max_length=100, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.reference} - {self.get_statut_display()}"

    class Meta:
        verbose_name = "Transaction de paiement"
        verbose_name_plural = "Transactions de paiement"
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['statut']),
        ]


# =============================================
# ✅ PROMOTIONS & WISHLIST
# =============================================

class Promotion(models.Model):
    """Modèle pour les promotions spéciales"""
    TYPE_CHOICES = [
        ('POURCENTAGE', 'Pourcentage'),
        ('FIXE', 'Montant fixe'),
        ('LIVRAISON', 'Livraison gratuite'),
    ]

    code = models.CharField(
        max_length=50, unique=True,
        validators=[code_promo_validator],
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    valeur = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    description = models.TextField(blank=True, max_length=500)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    utilisation_max = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(1000000)],
    )
    utilisation_actuelle = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    est_actif = models.BooleanField(default=True)

    def clean(self):
        super().clean()
        if self.date_debut and self.date_fin and self.date_fin <= self.date_debut:
            raise ValidationError({
                'date_fin': "La date de fin doit être postérieure à la date de début."
            })
        if self.type == 'POURCENTAGE' and self.valeur and self.valeur > 100:
            raise ValidationError({
                'valeur': "Un pourcentage ne peut pas dépasser 100."
            })

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} - {self.get_type_display()}"

    @property
    def est_valide(self):
        now = timezone.now()
        return (
            self.est_actif and
            self.date_debut <= now <= self.date_fin and
            self.utilisation_actuelle < self.utilisation_max
        )

    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        constraints = [
            models.CheckConstraint(
                check=Q(valeur__gt=0),
                name='promotion_valeur_positive'
            ),
            models.CheckConstraint(
                check=Q(date_fin__gt=F('date_debut')),
                name='promotion_dates_coherentes'
            ),
        ]


class Wishlist(models.Model):
    """Modèle pour la liste de souhaits des clients"""
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='wishlist')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['client', 'produit']
        verbose_name = "Liste de souhaits"
        verbose_name_plural = "Listes de souhaits"

    def __str__(self):
        return f"{self.client} - {self.produit}"


# =============================================
# ✅ RENDEZ-VOUS & ACTUALITÉS & FAQ
# =============================================

class RendezVous(models.Model):
    """Modèle pour les rendez-vous"""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRME', 'Confirmé'),
        ('ANNULE', 'Annulé'),
        ('TERMINE', 'Terminé'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='rendez_vous')
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='rendez_vous')
    forfait = models.ForeignKey(Forfait, on_delete=models.CASCADE)
    date_rendez_vous = models.DateTimeField()
    duree = models.IntegerField(
        validators=[MinValueValidator(15), MaxValueValidator(480)],
        help_text="Durée en minutes",
    )
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    notes = models.TextField(blank=True, max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client} - {self.date_rendez_vous}"

    class Meta:
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous"


class Actualite(models.Model):
    """Modèle pour les actualités / blog"""
    titre = models.CharField(max_length=200, validators=[MinLengthValidator(3)])
    slug = models.SlugField(unique=True, max_length=250)
    contenu = models.TextField(max_length=50000)
    extrait = models.TextField(blank=True, max_length=500)
    image = models.ImageField(upload_to='actualites/', null=True, blank=True)
    auteur = models.CharField(max_length=100, default="Madame Tibetia")
    categorie = models.CharField(max_length=50, blank=True)
    tags = models.JSONField(default=list, blank=True)
    est_publie = models.BooleanField(default=True)
    date_publication = models.DateTimeField(default=timezone.now)
    vues = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titre

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

    class Meta:
        verbose_name = "Actualité"
        verbose_name_plural = "Actualités"
        ordering = ['-date_publication']


class FAQ(models.Model):
    """Modèle pour les questions fréquentes"""
    question = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(5), MaxLengthValidator(200)],
    )
    reponse = models.TextField(max_length=5000, validators=[MinLengthValidator(5)])
    categorie = models.CharField(max_length=50, default='General')
    ordre = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    est_actif = models.BooleanField(default=True)

    def __str__(self):
        return self.question

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"
        ordering = ['ordre']


# =============================================
# ✅ NEWSLETTER, CONTACT & NOTIFICATIONS
# =============================================

class Newsletter(models.Model):
    """Modèle pour les abonnés à la newsletter"""
    email = models.EmailField(unique=True, validators=[MaxLengthValidator(254)])
    date_abonnement = models.DateTimeField(auto_now_add=True)
    est_actif = models.BooleanField(default=True)

    def clean(self):
        super().clean()
        if self.email:
            self.email = self.email.strip().lower()

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = "Abonné newsletter"
        verbose_name_plural = "Abonnés newsletter"
        ordering = ['-date_abonnement']


class ContactMessage(models.Model):
    """Modèle pour les messages de contact"""
    SUJET_CHOICES = [
        ('GENERAL', 'Demande générale'),
        ('FORMATION', 'Formation en ligne'),
        ('RELOCKING', 'Relooking'),
        ('PRODUIT', 'Produit / Boutique'),
        ('AUTRE', 'Autre'),
    ]

    nom = models.CharField(max_length=100, validators=[name_validator])
    prenom = models.CharField(max_length=100, validators=[name_validator])
    email = models.EmailField(validators=[MaxLengthValidator(254)])
    telephone = models.CharField(max_length=20, blank=True, validators=[phone_validator])
    sujet = models.CharField(max_length=20, choices=SUJET_CHOICES, default='GENERAL')
    message = models.TextField(
        max_length=2000,
        validators=[MinLengthValidator(10)],
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    est_lu = models.BooleanField(default=False)
    reponse = models.TextField(blank=True, max_length=2000)
    date_reponse = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.get_sujet_display()}"

    class Meta:
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"
        ordering = ['-date_creation']


class Notification(models.Model):
    """Modèle pour les notifications des utilisateurs"""
    TYPE_CHOICES = [
        ('COMMANDE', 'Commande'),
        ('INSCRIPTION', 'Inscription formation'),
        ('EVENEMENT', 'Événement'),
        ('PROMOTION', 'Promotion'),
        ('GENERAL', 'Général'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=200, validators=[MinLengthValidator(3)])
    message = models.TextField(max_length=500, validators=[MinLengthValidator(5)])
    lien = models.CharField(max_length=200, blank=True)
    est_lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client} - {self.titre}"

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']


# =============================================
# ✅ ADMIN & CONFIGURATION
# =============================================

class AdminLog(models.Model):
    """Journal des actions des administrateurs"""
    ACTION_CHOICES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
    ]

    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin.username} - {self.action} - {self.model_name}"

    class Meta:
        verbose_name = "Journal administrateur"
        verbose_name_plural = "Journaux administrateur"
        ordering = ['-created_at']


class SiteSettings(models.Model):
    """Paramètres du site (singleton)"""
    site_name = models.CharField(max_length=100, default="Madame Tibetia")
    site_description = models.TextField(default="L'élégance du coaching personnalisé")
    logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    favicon = models.ImageField(upload_to='settings/', null=True, blank=True)
    contact_email = models.EmailField(default="contact@madametibetia.com")
    contact_phone = models.CharField(max_length=20, default="+33 6 12 34 56 78")
    contact_address = models.TextField(default="123 Avenue de l'Élégance, 75001 Paris")
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    maintenance_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Singleton : empêche la création de plusieurs instances."""
        self.pk = 1
        # ✅ Validation des champs avant sauvegarde
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.site_name

    class Meta:
        verbose_name = "Paramètre du site"
        verbose_name_plural = "Paramètres du site"


class OTPCode(models.Model):
    """Modèle pour les codes OTP"""
    email = models.EmailField(validators=[MaxLengthValidator(254)])
    code = models.CharField(
        max_length=6,
        validators=[RegexValidator(r'^\d{6}$', "Le code OTP doit contenir exactement 6 chiffres.")],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} - {self.code} - {'Utilisé' if self.is_used else 'Valide'}"

    @property
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    class Meta:
        verbose_name = "Code OTP"
        verbose_name_plural = "Codes OTP"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'code']),
        ]


class InscriptionRelooking(models.Model):
    """Modèle pour les inscriptions aux rubriques de relooking"""
    TYPE_CHOICES = [
        ('FEMME', 'Relooking Femme'),
        ('HOMME', 'Relooking Homme'),
        ('ATELIER', 'Atelier Relooking'),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    # Pour Femme & Homme
    rubrique_id = models.IntegerField(null=True, blank=True)
    rubrique_nom = models.CharField(max_length=200, blank=True)

    # Pour Atelier
    atelier_id = models.IntegerField(null=True, blank=True)
    atelier_nom = models.CharField(max_length=200, blank=True)

    # Informations client
    nom = models.CharField(max_length=100, validators=[name_validator])
    prenom = models.CharField(max_length=100, validators=[name_validator])
    email = models.EmailField(validators=[MaxLengthValidator(254)])
    telephone = models.CharField(max_length=20, validators=[phone_validator])
    date_souhaitee = models.DateField(null=True, blank=True)
    nb_personnes = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )
    message = models.TextField(blank=True, max_length=500)

    # Prix et durée (copie de la rubrique)
    prix = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    duree = models.CharField(max_length=50, blank=True)

    statut = models.CharField(max_length=20, default='EN_ATTENTE')
    date_inscription = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.type}"

    class Meta:
        verbose_name = "Inscription Relooking"
        verbose_name_plural = "Inscriptions Relooking"
        ordering = ['-date_inscription']