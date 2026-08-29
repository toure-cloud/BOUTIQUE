from django.db import models
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime

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
    caracteristiques = models.JSONField(default=list)  # Liste des fonctionnalités
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
     verbose_name = "Forfait"
     verbose_name_plural = "Forfaits"
     ordering = ['-created_at']

    def __str__(self):
        return f"{self.nom} - {self.prix}€"
        

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
        # Initialiser places_restantes si pas défini
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
        unique_together = ['evenement', 'client']  # Un client ne peut pas s'inscrire deux fois

    def __str__(self):
        return f"{self.client} - {self.evenement}"


class Produit(models.Model):
    """Modèle pour les produits de la boutique"""
    CATEGORIE_CHOICES = [
        ('VETEMENT', 'Vêtement'),
        ('ACCESSOIRE', 'Accessoire'),
        ('LIVRE', 'Livre'),
        ('AUTRE', 'Autre'),
    ]
    
    nom = models.CharField(max_length=200)
    description = models.TextField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES)
    image_principale = models.ImageField(upload_to='produits/')
    images_secondaires = models.JSONField(default=list)
    taille = models.CharField(max_length=20, blank=True)
    quantite_stock = models.IntegerField(validators=[MinValueValidator(0)])
    est_disponible = models.BooleanField(default=True)
    est_en_promotion = models.BooleanField(default=False)
    prix_promotion = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    model_3d_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.prix}€"

    @property
    def prix_actuel(self):
        if self.est_en_promotion and self.prix_promotion:
            return self.prix_promotion
        return self.prix

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix}€"
    
    class Meta:
        verbose_name = "Rubrique Relooking Femme"
        verbose_name_plural = "Rubriques Relooking Femme"
        ordering = ['ordre', 'nom']

# api/models.py - Ajoutez ces modèles

class RubriqueRelookingHomme(models.Model):
    """Modèle pour les rubriques de relooking homme"""
    CATEGORIE_CHOICES = [
        ('COACHING', 'Coaching Relooking'),
        ('BILAN', 'Bilan d\'Image'),
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"
    
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
    
    # Spécifique aux ateliers en groupe
    nb_personnes_min = models.IntegerField(default=2, help_text="Nombre minimum de participants")
    nb_personnes_max = models.IntegerField(default=6, help_text="Nombre maximum de participants")
    
    image = models.ImageField(upload_to='ateliers/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    ordre = models.IntegerField(default=0)
    note = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.prix} CFA"
    
    @property
    def places_display(self):
        return f"{self.nb_personnes_min} - {self.nb_personnes_max} personnes"
    
    class Meta:
        verbose_name = "Atelier Relooking en Groupe"
        verbose_name_plural = "Ateliers Relooking en Groupe"
        ordering = ['ordre', 'nom']

# api/models.py

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
    client = models.ForeignKey('Client', on_delete=models.CASCADE)
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
        from django.utils import timezone
        return (
            self.statut == 'ACTIF' and 
            self.date_expiration > timezone.now()
        )
    
    @property
    def est_utilisable(self):
        from django.utils import timezone
        return (
            self.statut == 'ACTIF' and 
            self.date_expiration > timezone.now() and
            self.date_utilisation is None
        )
    
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
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='inscriptions_formations')
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

# api/models.py - Ajoutez ces modèles

class MoyenPaiement(models.Model):
    """Modèle pour les moyens de paiement disponibles"""
    TYPE_CHOICES = [
        ('WAVE', 'Wave'),
        ('ORANGE_MONEY', 'Orange Money'),
        ('MOOV_MONEY', 'Moov Money'),
        ('CARTE_BANCAIRE', 'Carte Bancaire'),
        ('MTN_MONEY', 'MTN Mobile Money'),
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
    
    inscription = models.ForeignKey('InscriptionFormation', on_delete=models.CASCADE, related_name='transactions')
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