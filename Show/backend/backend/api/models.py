# api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime
from django.utils import timezone

class Coach(models.Model):
    """Modèle pour le coach (Madame T)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    bio = models.TextField()
    photo = models.ImageField(upload_to='coach/', null=True, blank=True)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    specialites = models.TextField()
    experience = models.IntegerField()  # Années d'expérience
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
    
    nom = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    duree = models.IntegerField(help_text="Durée en jours")
    nb_seances = models.IntegerField(help_text="Nombre de séances")
    caracteristiques = models.JSONField(default=list)
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Forfait"
        verbose_name_plural = "Forfaits"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"


class Client(models.Model):
    """Modèle pour les clients"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)
    date_naissance = models.DateField(null=True, blank=True)
    adresse = models.TextField(blank=True)
    photo = models.ImageField(upload_to='clients/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class RendezVous(models.Model):
    """Modèle pour les rendez-vous"""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRME', 'Confirmé'),
        ('ANNULE', 'Annulé'),
        ('TERMINE', 'Terminé'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE)
    forfait = models.ForeignKey(Forfait, on_delete=models.CASCADE)
    date_rendez_vous = models.DateTimeField()
    duree = models.IntegerField(help_text="Durée en minutes")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client} - {self.date_rendez_vous}"


class Evenement(models.Model):
    """Modèle pour les événements"""
    STATUT_CHOICES = [
        ('A_VENIR', 'À venir'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ANNULE', 'Annulé'),
    ]
    
    titre = models.CharField(max_length=200)
    theme = models.CharField(max_length=200)
    description = models.TextField()
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    lieu = models.CharField(max_length=200)
    places_total = models.IntegerField(validators=[MinValueValidator(1)])
    places_restantes = models.IntegerField()
    prix = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='evenements/', null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='A_VENIR')
    est_gratuit = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.places_restantes = self.places_total
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titre} - {self.date_debut}"


class ParticipationEvenement(models.Model):
    """Modèle pour les participations aux événements"""
    STATUT_CHOICES = [
        ('INSCRIT', 'Inscrit'),
        ('PRESENT', 'Présent'),
        ('ABSENT', 'Absent'),
        ('ANNULE', 'Annulé'),
    ]
    
    evenement = models.ForeignKey(Evenement, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_inscription = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='INSCRIT')
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['evenement', 'client']

    def __str__(self):
        return f"{self.client} - {self.evenement}"


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
    
    nom = models.CharField(max_length=200)
    description = models.TextField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES)
    image_principale = models.ImageField(upload_to='produits/')
    images_secondaires = models.JSONField(default=list, blank=True)
    taille = models.CharField(max_length=20, blank=True)
    quantite_stock = models.IntegerField(validators=[MinValueValidator(0)])
    est_disponible = models.BooleanField(default=True)
    est_en_promotion = models.BooleanField(default=False)
    prix_promotion = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    note = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    nb_avis = models.IntegerField(default=0)
    model_3d_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['-created_at']


class Panier(models.Model):
    """Modèle pour le panier d'achat"""
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    est_valide = models.BooleanField(default=False)

    def __str__(self):
        return f"Panier de {self.client}"


class LignePanier(models.Model):
    """Modèle pour les lignes du panier"""
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(validators=[MinValueValidator(1)])
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.produit} x {self.quantite}"


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
    total = models.DecimalField(max_digits=10, decimal_places=2)
    adresse_livraison = models.TextField()
    ville = models.CharField(max_length=100, blank=True)
    code_postal = models.CharField(max_length=10, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Commande #{self.id} - {self.client}"


class LigneCommande(models.Model):
    """Modèle pour les lignes de commande"""
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(validators=[MinValueValidator(1)])
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def sous_total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.produit} x {self.quantite}"


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
    
    nom = models.CharField(max_length=100)
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField()
    description_detail = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    duree = models.CharField(max_length=50, help_text="Durée de la prestation")
    image = models.ImageField(upload_to='relooking_femme/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
    note = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    nb_avis = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"
    
    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"
    
    class Meta:
        verbose_name = "Rubrique Relooking Femme"
        verbose_name_plural = "Rubriques Relooking Femme"
        ordering = ['ordre', 'nom']


class RubriqueRelookingHomme(models.Model):
    """Modèle pour les rubriques de relooking homme"""
    CATEGORIE_CHOICES = [
        ('COACHING', 'Coaching Relooking'),
        ('BILAN', "Bilan d'Image"),
        ('SUBLIME', 'Relooking Sublime'),
        ('VINTAGE', 'Relooking Vintage'),
    ]
    
    nom = models.CharField(max_length=100)
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField()
    description_detail = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    duree = models.CharField(max_length=50, help_text="Durée de la prestation")
    image = models.ImageField(upload_to='relooking_homme/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
    note = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    nb_avis = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"
    
    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"
    
    class Meta:
        verbose_name = "Rubrique Relooking Homme"
        verbose_name_plural = "Rubriques Relooking Homme"
        ordering = ['ordre', 'nom']


class RubriqueAtelier(models.Model):
    """Modèle pour les ateliers de relooking en groupe (2 à 6 personnes)"""
    CATEGORIE_CHOICES = [
        ('STYLE', 'Atelier Style et Élégance'),
        ('GROUPE', 'Atelier Relooking de Groupe'),
        ('MASTERCLASS', 'Masterclass Image et Confiance'),
    ]
    
    nom = models.CharField(max_length=100)
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES)
    description = models.TextField()
    description_detail = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    duree = models.CharField(max_length=50, help_text="Durée de l'atelier")
    nb_personnes_min = models.IntegerField(default=2, help_text="Nombre minimum de participants")
    nb_personnes_max = models.IntegerField(default=6, help_text="Nombre maximum de participants")
    image = models.ImageField(upload_to='ateliers/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
    note = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    nb_avis = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"
    
    @property
    def prix_formate(self):
        return f"{int(self.prix)} CFA"
    
    @property
    def places_display(self):
        return f"{self.nb_personnes_min} - {self.nb_personnes_max} personnes"
    
    class Meta:
        verbose_name = "Atelier Relooking en Groupe"
        verbose_name_plural = "Ateliers Relooking en Groupe"
        ordering = ['ordre', 'nom']


class FormationEnLigne(models.Model):
    """Modèle pour les formations en ligne (Elegance Times online)"""
    STATUT_CHOICES = [
        ('PROGRAMME', 'Programmé'),
        ('LIVE', 'En direct'),
        ('REPLAY', 'Replay disponible'),
        ('TERMINE', 'Terminé'),
    ]
    
    titre = models.CharField(max_length=200)
    description = models.TextField()
    description_detail = models.TextField(blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    duree = models.CharField(max_length=50, help_text="Durée de la formation")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='PROGRAMME')
    date_live = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to='formations/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True, help_text="URL de la vidéo (Vimeo/Youtube)")
    replay_url = models.URLField(blank=True, null=True, help_text="URL du replay")
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
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
    
    class Meta:
        verbose_name = "Formation en ligne"
        verbose_name_plural = "Formations en ligne"
        ordering = ['ordre', 'date_live']


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
    montant_paye = models.DecimalField(max_digits=10, decimal_places=2)
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
    code_acces = models.OneToOneField(CodeAccesFormation, on_delete=models.SET_NULL, null=True, blank=True, related_name='inscription')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_inscription = models.DateTimeField(auto_now_add=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    reference_paiement = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.client} - {self.formation.titre}"
    
    class Meta:
        verbose_name = "Inscription formation"
        verbose_name_plural = "Inscriptions formations"
        ordering = ['-date_inscription']
        unique_together = ['formation', 'client']


class MoyenPaiement(models.Model):
    """Modèle pour les moyens de paiement disponibles"""
    TYPE_CHOICES = [
        ('WAVE', 'Wave'),
        ('ORANGE_MONEY', 'Orange Money'),
        ('MOOV_MONEY', 'Moov Money'),
        ('MTN_MONEY', 'MTN Mobile Money'),
        ('CARTE_BANCAIRE', 'Carte Bancaire'),
    ]
    
    nom = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    logo = models.ImageField(upload_to='paiement/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
    
    def __str__(self):
        return self.nom
    
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
    montant = models.DecimalField(max_digits=10, decimal_places=2)
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


# ========== NOUVEAUX MODÈLES AJOUTÉS ==========

class AvisProduit(models.Model):
    """Modèle pour les avis sur les produits"""
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis')
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    note = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    commentaire = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    est_approuve = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.client} - {self.produit} - {self.note} étoiles"
    
    class Meta:
        verbose_name = "Avis produit"
        verbose_name_plural = "Avis produits"
        ordering = ['-date_creation']
        unique_together = ['produit', 'client']


class Promotion(models.Model):
    """Modèle pour les promotions spéciales"""
    TYPE_CHOICES = [
        ('POURCENTAGE', 'Pourcentage'),
        ('FIXE', 'Montant fixe'),
        ('LIVRAISON', 'Livraison gratuite'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    valeur = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    utilisation_max = models.IntegerField(default=1)
    utilisation_actuelle = models.IntegerField(default=0)
    est_actif = models.BooleanField(default=True)
    
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


class Actualite(models.Model):
    """Modèle pour les actualités / blog"""
    titre = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    contenu = models.TextField()
    extrait = models.TextField(blank=True, help_text="Résumé de l'article")
    image = models.ImageField(upload_to='actualites/', null=True, blank=True)
    auteur = models.CharField(max_length=100, default="Madame Tibetia")
    categorie = models.CharField(max_length=50, blank=True)
    tags = models.JSONField(default=list, blank=True)
    est_publie = models.BooleanField(default=True)
    date_publication = models.DateTimeField(default=timezone.now)
    vues = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.titre
    
    class Meta:
        verbose_name = "Actualité"
        verbose_name_plural = "Actualités"
        ordering = ['-date_publication']


class FAQ(models.Model):
    """Modèle pour les questions fréquentes"""
    question = models.CharField(max_length=200)
    reponse = models.TextField()
    categorie = models.CharField(max_length=50, default='General')
    ordre = models.IntegerField(default=0)
    est_actif = models.BooleanField(default=True)
    
    def __str__(self):
        return self.question
    
    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"
        ordering = ['ordre']


class Newsletter(models.Model):
    """Modèle pour les abonnés à la newsletter"""
    email = models.EmailField(unique=True)
    date_abonnement = models.DateTimeField(auto_now_add=True)
    est_actif = models.BooleanField(default=True)
    
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
    
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20, blank=True)
    sujet = models.CharField(max_length=20, choices=SUJET_CHOICES, default='GENERAL')
    message = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    est_lu = models.BooleanField(default=False)
    reponse = models.TextField(blank=True)
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
    titre = models.CharField(max_length=200)
    message = models.TextField()
    lien = models.CharField(max_length=200, blank=True, help_text="Lien vers la page concernée")
    est_lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.client} - {self.titre}"
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']