# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Coach, Forfait, Client, RendezVous, Evenement, ParticipationEvenement,
    Produit, ImageProduit, Panier, LignePanier, Commande, LigneCommande,
    RubriqueRelookingFemme, RubriqueRelookingHomme, RubriqueAtelier,
    FormationEnLigne, CodeAccesFormation, InscriptionFormation,
    MoyenPaiement, TransactionPaiement, AvisProduit, Promotion,
    Wishlist, Actualite, FAQ, Newsletter, ContactMessage,
    Notification, AdminLog, SiteSettings, OTPCode,InscriptionRelooking
)


# =============================================
# ✅ AUTHENTIFICATION & UTILISATEURS
# =============================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']


class ClientSerializer(serializers.ModelSerializer):
    """Serializer pour afficher un client"""
    user_data = UserSerializer(source='user', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'user', 'user_data', 'nom', 'prenom', 'full_name',
            'email', 'telephone', 'adresse', 'created_at', 'updated_at'
        ]

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


class ClientRegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un client avec mot de passe"""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Client
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        client = Client.objects.create(**validated_data)
        client.set_password(password)  # ✅ Hachage du mot de passe
        client.save()
        return client


class ClientLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion d'un client"""
    email = serializers.EmailField()
    password = serializers.CharField()


class OTPCodeSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = OTPCode
        fields = ['id', 'email', 'code', 'created_at', 'expires_at', 'is_used', 'is_valid']


# =============================================
# ✅ COACH & FORFAITS
# =============================================

class CoachSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = [
            'id', 'user', 'nom', 'prenom', 'full_name', 'bio', 'photo', 'photo_url',
            'email', 'telephone', 'specialites', 'experience',
            'facebook', 'instagram', 'linkedin',
            'created_at', 'updated_at'
        ]

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo:
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


class ForfaitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forfait
        fields = '__all__'


# =============================================
# ✅ RENDEZ-VOUS
# =============================================

class RendezVousSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.full_name', read_only=True)

    class Meta:
        model = RendezVous
        fields = '__all__'


# =============================================
# ✅ ÉVÉNEMENTS
# =============================================

class EvenementSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    places_restantes = serializers.IntegerField(read_only=True)
    est_complet = serializers.SerializerMethodField()

    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'theme', 'description', 'date_debut', 'date_fin',
            'lieu', 'places_total', 'places_restantes', 'prix', 'image',
            'image_url', 'statut', 'est_gratuit', 'est_complet',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_est_complet(self, obj):
        return obj.places_restantes <= 0


class ParticipationEvenementSerializer(serializers.ModelSerializer):
    client_details = ClientSerializer(source='client', read_only=True)
    evenement_details = EvenementSerializer(source='evenement', read_only=True)

    class Meta:
        model = ParticipationEvenement
        fields = [
            'id', 'evenement', 'evenement_details', 'client', 'client_details',
            'date_inscription', 'statut', 'notes'
        ]


# =============================================
# ✅ PRODUITS & BOUTIQUE
# =============================================

class ImageProduitSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'image_url', 'ordre']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProduitSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    prix_actuel = serializers.ReadOnlyField()
    prix_formate = serializers.ReadOnlyField()
    images_secondaires = ImageProduitSerializer(many=True, read_only=True)
    note_formatee = serializers.SerializerMethodField()

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'prix_actuel', 'prix_formate',
            'categorie', 'image_principale', 'image_url', 'taille',
            'quantite_stock', 'est_disponible', 'est_en_promotion',
            'prix_promotion', 'note', 'note_formatee', 'nb_avis',
            'model_3d_url', 'images_secondaires', 'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image_principale:
            if request:
                return request.build_absolute_uri(obj.image_principale.url)
            return obj.image_principale.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"


class AvisProduitSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = AvisProduit
        fields = [
            'id', 'produit', 'client', 'client_name', 'note',
            'commentaire', 'date_creation', 'date_formatee', 'est_approuve'
        ]

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y')


# =============================================
# ✅ PANIER & COMMANDES
# =============================================

class LignePanierSerializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_prix = serializers.DecimalField(source='produit.prix', read_only=True, max_digits=10, decimal_places=2)
    produit_image = serializers.SerializerMethodField()
    produit_stock = serializers.IntegerField(source='produit.quantite_stock', read_only=True)  # ✅ AJOUTÉ

    class Meta:
        model = LignePanier
        fields = ['id', 'produit', 'produit_nom', 'produit_prix', 'produit_image', 'produit_stock', 'quantite', 'prix_unitaire', 'sous_total']

    def get_produit_image(self, obj):
        request = self.context.get('request')
        if obj.produit and obj.produit.image_principale:
            if request:
                return request.build_absolute_uri(obj.produit.image_principale.url)
            return obj.produit.image_principale.url
        return None

class PanierSerializer(serializers.ModelSerializer):
    lignes = LignePanierSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_articles = serializers.SerializerMethodField()

    class Meta:
        model = Panier
        fields = ['id', 'client', 'lignes', 'total', 'total_articles', 'est_valide', 'date_creation']

    def get_total(self, obj):
        total = 0
        for ligne in obj.lignes.all():
            total += ligne.sous_total
        return total

    def get_total_articles(self, obj):
        return sum(ligne.quantite for ligne in obj.lignes.all())


class LigneCommandeSerializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_prix = serializers.DecimalField(source='produit.prix', read_only=True, max_digits=10, decimal_places=2)
    produit_image = serializers.SerializerMethodField()

    class Meta:
        model = LigneCommande
        fields = ['id', 'produit', 'produit_nom', 'produit_prix', 'quantite', 'prix_unitaire', 'sous_total', 'produit_image']

    def get_produit_image(self, obj):
        request = self.context.get('request')
        if obj.produit and obj.produit.image_principale:
            if request:
                return request.build_absolute_uri(obj.produit.image_principale.url)
            return obj.produit.image_principale.url
        return None


class CommandeSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    client_details = ClientSerializer(source='client', read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    total_formate = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_details', 'client_name', 'date_commande', 'statut',
            'total', 'total_formate', 'adresse_livraison', 'ville',
            'code_postal', 'telephone', 'notes', 'lignes'
        ]

    def get_total_formate(self, obj):
        return f"{int(obj.total)} CFA"


# =============================================
# ✅ RELOOKING & ATELIERS
# =============================================

class RubriqueRelookingFemmeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    note_formatee = serializers.SerializerMethodField()

    class Meta:
        model = RubriqueRelookingFemme
        fields = [
            'id', 'nom', 'categorie', 'description', 'description_detail',
            'prix', 'prix_formate', 'duree', 'image', 'image_url',
            'est_actif', 'ordre', 'note', 'note_formatee', 'nb_avis',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"


class RubriqueRelookingHommeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    note_formatee = serializers.SerializerMethodField()

    class Meta:
        model = RubriqueRelookingHomme
        fields = [
            'id', 'nom', 'categorie', 'description', 'description_detail',
            'prix', 'prix_formate', 'duree', 'image', 'image_url',
            'est_actif', 'ordre', 'note', 'note_formatee', 'nb_avis',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"


class RubriqueAtelierSerializer(serializers.ModelSerializer):
    prix_formate = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    note_formatee = serializers.SerializerMethodField()
    places_display = serializers.ReadOnlyField()

    class Meta:
        model = RubriqueAtelier
        fields = [
            'id', 'nom', 'categorie', 'description', 'description_detail',
            'prix', 'prix_formate', 'duree', 'nb_personnes_min',
            'nb_personnes_max', 'places_display', 'image', 'image_url',
            'est_actif', 'ordre', 'note', 'note_formatee', 'nb_avis',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"


# =============================================
# ✅ FORMATIONS EN LIGNE & INSCRIPTIONS
# =============================================

class FormationEnLigneSerializer(serializers.ModelSerializer):
    prix_formate = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    est_live = serializers.ReadOnlyField()
    est_replay = serializers.ReadOnlyField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = FormationEnLigne
        fields = [
            'id', 'titre', 'description', 'description_detail', 'prix',
            'prix_formate', 'duree', 'statut', 'statut_display',
            'date_live', 'image', 'image_url', 'video_url', 'replay_url',
            'est_actif', 'ordre', 'est_live', 'est_replay',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CodeAccesFormationSerializer(serializers.ModelSerializer):
    formation_titre = serializers.CharField(source='formation.titre', read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    est_valide = serializers.ReadOnlyField()
    est_utilisable = serializers.ReadOnlyField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = CodeAccesFormation
        fields = [
            'id', 'formation', 'formation_titre', 'client', 'client_name',
            'code', 'statut', 'statut_display', 'date_creation',
            'date_utilisation', 'date_expiration', 'montant_paye',
            'reference_paiement', 'est_valide', 'est_utilisable'
        ]


# api/serializers.py

class InscriptionFormationSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    formation_titre = serializers.CharField(source='formation.titre', read_only=True)
    
    # ✅ AJOUTEZ CECI : Renvoyer les objets complets
    client_details = ClientSerializer(source='client', read_only=True)
    formation_details = FormationEnLigneSerializer(source='formation', read_only=True)
    
    class Meta:
        model = InscriptionFormation
        fields = [
            'id', 'formation', 'formation_titre', 'formation_details',
            'client', 'client_name', 'client_details',
            'code_acces', 'statut', 'date_inscription', 'montant',
            'reference_paiement', 'notes'
        ]

# =============================================
# ✅ PAIEMENTS
# =============================================

class MoyenPaiementSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = MoyenPaiement
        fields = [
            'id', 'nom', 'type', 'type_display', 'logo', 'logo_url',
            'description', 'est_actif', 'ordre', 'created_at', 'updated_at'
        ]

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo:
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class TransactionPaiementSerializer(serializers.ModelSerializer):
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True, allow_null=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    montant_formate = serializers.SerializerMethodField()

    class Meta:
        model = TransactionPaiement
        fields = [
            'id', 'inscription', 'moyen_paiement', 'moyen_paiement_nom',
            'montant', 'montant_formate', 'reference', 'statut',
            'statut_display', 'numero_transaction', 'date_creation',
            'date_validation', 'details'
        ]

    def get_montant_formate(self, obj):
        return f"{int(obj.montant)} CFA"


# =============================================
# ✅ PROMOTIONS & WISHLIST
# =============================================

class PromotionSerializer(serializers.ModelSerializer):
    est_valide = serializers.ReadOnlyField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Promotion
        fields = [
            'id', 'code', 'type', 'type_display', 'valeur',
            'description', 'date_debut', 'date_fin', 'utilisation_max',
            'utilisation_actuelle', 'est_actif', 'est_valide'
        ]


class WishlistSerializer(serializers.ModelSerializer):
    produit_data = ProduitSerializer(source='produit', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'client', 'produit', 'produit_data', 'date_ajout']


# =============================================
# ✅ ACTUALITÉS, FAQ & DIVERS
# =============================================

class ActualiteSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'slug', 'contenu', 'extrait', 'image',
            'image_url', 'auteur', 'categorie', 'tags', 'est_publie',
            'date_publication', 'date_formatee', 'vues',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_date_formatee(self, obj):
        return obj.date_publication.strftime('%d %B %Y')


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'reponse', 'categorie', 'ordre', 'est_actif']


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'date_abonnement', 'est_actif']


# =============================================
# ✅ CONTACT & NOTIFICATIONS
# =============================================

class ContactMessageSerializer(serializers.ModelSerializer):
    sujet_display = serializers.CharField(source='get_sujet_display', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessage
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'sujet',
            'sujet_display', 'message', 'date_creation', 'date_formatee',
            'est_lu', 'reponse', 'date_reponse'
        ]

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y à %H:%M')


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'client', 'type', 'type_display', 'titre', 'message',
            'lien', 'est_lu', 'date_creation', 'date_formatee'
        ]

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y à %H:%M')


# =============================================
# ✅ ADMIN & CONFIGURATION
# =============================================

class AdminLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin', 'admin_username', 'action', 'action_display',
            'model_name', 'object_id', 'details', 'ip_address',
            'created_at', 'date_formatee'
        ]

    def get_date_formatee(self, obj):
        return obj.created_at.strftime('%d/%m/%Y à %H:%M')


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            'id', 'site_name', 'site_description', 'logo', 'logo_url',
            'favicon', 'favicon_url', 'contact_email', 'contact_phone',
            'contact_address', 'facebook_url', 'instagram_url',
            'linkedin_url', 'twitter_url', 'maintenance_mode',
            'created_at', 'updated_at'
        ]

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo:
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def get_favicon_url(self, obj):
        request = self.context.get('request')
        if obj.favicon:
            if request:
                return request.build_absolute_uri(obj.favicon.url)
            return obj.favicon.url
        return None
    # api/serializers.py (Ajoutez à la fin)

class InscriptionRelookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscriptionRelooking
        fields = '__all__'