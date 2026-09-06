# api/serializers.py
from rest_framework import serializers
from .models import (
    FormationEnLigne,
    Evenement,
    Produit,
    Forfait,
    RubriqueRelookingFemme,
    RubriqueRelookingHomme,
    RubriqueAtelier,
    Coach,
    Actualite,
    FAQ,
    ImageProduit,
    Client,
    RendezVous,
    ParticipationEvenement,
    Panier,
    LignePanier,
    Commande,
    LigneCommande,
    CodeAccesFormation,
    InscriptionFormation,
    MoyenPaiement,
    TransactionPaiement,
    AvisProduit,
    Promotion,
    Wishlist,
    ContactMessage,
    Notification,
    AdminLog,
    SiteSettings,
)


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'ordre', 'created_at']


class FormationEnLigneSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormationEnLigne
        fields = [
            'id', 'titre', 'description', 'description_detail',
            'prix', 'prix_formate', 'duree', 'statut', 'date_live',
            'image', 'video_url', 'replay_url',
            'est_actif', 'est_live', 'est_replay',
            'ordre', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EvenementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'theme', 'description',
            'date_debut', 'date_fin', 'lieu',
            'places_total', 'places_restantes',
            'prix', 'image', 'statut', 'est_gratuit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if 'places_total' in data and data['places_total'] <= 0:
            raise serializers.ValidationError({
                'places_total': 'Le nombre de places doit être supérieur à 0'
            })
        
        if 'date_debut' in data and 'date_fin' in data:
            if data['date_debut'] >= data['date_fin']:
                raise serializers.ValidationError({
                    'date_fin': 'La date de fin doit être postérieure à la date de début'
                })
        
        return data


class ProduitSerializer(serializers.ModelSerializer):
    images_secondaires = ImageProduitSerializer(many=True, read_only=True)
    prix_actuel = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    prix_formate = serializers.CharField(read_only=True)

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'prix_actuel', 'prix_formate',
            'categorie', 'image_principale', 'images_secondaires',
            'taille', 'quantite_stock', 'est_disponible',
            'est_en_promotion', 'prix_promotion',
            'note', 'nb_avis', 'model_3d_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'note', 'nb_avis']


class ForfaitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forfait
        fields = [
            'id', 'nom', 'type', 'description',
            'prix', 'duree', 'nb_seances',
            'caracteristiques', 'est_actif',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RubriqueRelookingFemmeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.CharField(read_only=True)

    class Meta:
        model = RubriqueRelookingFemme
        fields = [
            'id', 'nom', 'categorie', 'description',
            'description_detail', 'prix', 'prix_formate',
            'duree', 'image', 'est_actif', 'ordre',
            'note', 'nb_avis', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'note', 'nb_avis']


class RubriqueRelookingHommeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.CharField(read_only=True)

    class Meta:
        model = RubriqueRelookingHomme
        fields = [
            'id', 'nom', 'categorie', 'description',
            'description_detail', 'prix', 'prix_formate',
            'duree', 'image', 'est_actif', 'ordre',
            'note', 'nb_avis', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'note', 'nb_avis']


class RubriqueAtelierSerializer(serializers.ModelSerializer):
    prix_formate = serializers.CharField(read_only=True)
    places_display = serializers.CharField(read_only=True)

    class Meta:
        model = RubriqueAtelier
        fields = [
            'id', 'nom', 'categorie', 'description',
            'description_detail', 'prix', 'prix_formate',
            'duree', 'nb_personnes_min', 'nb_personnes_max',
            'places_display', 'image', 'est_actif', 'ordre',
            'note', 'nb_avis', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'note', 'nb_avis']


class CoachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coach
        fields = [
            'id', 'nom', 'prenom', 'bio', 'photo',
            'email', 'telephone', 'specialites',
            'experience', 'facebook', 'instagram', 'linkedin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActualiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'slug', 'contenu', 'extrait',
            'image', 'auteur', 'categorie', 'tags',
            'est_publie', 'date_publication', 'vues',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'vues']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'reponse',
            'categorie', 'ordre', 'est_actif'
        ]
        read_only_fields = ['id']


class MoyenPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoyenPaiement
        fields = [
            'id', 'nom', 'type', 'logo',
            'est_actif', 'ordre', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id', 'user', 'nom', 'prenom', 'email',
            'telephone', 'adresse', 'photo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ParticipationEvenementSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True, default='')
    client_prenom = serializers.CharField(source='client.prenom', read_only=True, default='')
    client_email = serializers.EmailField(source='client.email', read_only=True, default='')
    client_telephone = serializers.CharField(source='client.telephone', read_only=True, default='')
    evenement_titre = serializers.CharField(source='evenement.titre', read_only=True, default='')
    client = ClientSerializer(read_only=True)
    
    class Meta:
        model = ParticipationEvenement
        fields = [
            'id', 'evenement', 'evenement_titre',
            'client', 'client_nom', 'client_prenom',
            'client_email', 'client_telephone',
            'date_inscription', 'statut', 'notes'
        ]
        read_only_fields = ['id', 'date_inscription']


class TransactionPaiementSerializer(serializers.ModelSerializer):
    client_email = serializers.SerializerMethodField()
    client_nom = serializers.SerializerMethodField()
    moyen_paiement_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = TransactionPaiement
        fields = [
            'id', 'reference', 'montant', 'statut',
            'moyen_paiement', 'moyen_paiement_nom',
            'numero_transaction', 'client_email', 'client_nom',
            'date_creation', 'date_validation', 'details',
            'inscription'
        ]
        read_only_fields = ['id', 'reference', 'date_creation']

    def get_client_email(self, obj):
        if obj.details:
            return obj.details.get('email', '')
        return ''

    def get_client_nom(self, obj):
        if obj.details:
            nom = obj.details.get('nom', '')
            prenom = obj.details.get('prenom', '')
            return f"{prenom} {nom}".strip()
        return ''

    def get_moyen_paiement_nom(self, obj):
        if obj.moyen_paiement:
            return obj.moyen_paiement.nom
        return ''


class InscriptionFormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscriptionFormation
        fields = [
            'id', 
            'formation', 
            'client', 
            'code_acces', 
            'statut', 
            'date_inscription', 
            'montant', 
            'reference_paiement', 
            'notes'
        ]
        # ✅ Permettre la mise à jour partielle
        read_only_fields = ['id', 'date_inscription', 'reference_paiement']
        # ✅ Ne pas rendre formation, client, montant read_only
        # pour permettre la mise à jour si nécessaire

class RendezVousSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = [
            'id', 'client', 'coach', 'forfait',
            'date_rendez_vous', 'duree', 'statut',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PanierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Panier
        fields = [
            'id', 'client', 'date_creation', 'est_valide'
        ]
        read_only_fields = ['id', 'date_creation']


class LignePanierSerializer(serializers.ModelSerializer):
    sous_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = LignePanier
        fields = [
            'id', 'panier', 'produit', 'quantite',
            'prix_unitaire', 'sous_total'
        ]


class CommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'date_commande', 'statut',
            'total', 'adresse_livraison', 'ville',
            'code_postal', 'telephone', 'notes'
        ]
        read_only_fields = ['id', 'date_commande']


class LigneCommandeSerializer(serializers.ModelSerializer):
    sous_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = LigneCommande
        fields = [
            'id', 'commande', 'produit', 'quantite',
            'prix_unitaire', 'sous_total'
        ]


class CodeAccesFormationSerializer(serializers.ModelSerializer):
    est_valide = serializers.BooleanField(read_only=True)
    est_utilisable = serializers.BooleanField(read_only=True)

    class Meta:
        model = CodeAccesFormation
        fields = [
            'id', 'formation', 'client', 'code',
            'statut', 'date_creation', 'date_utilisation',
            'date_expiration', 'montant_paye',
            'reference_paiement', 'est_valide', 'est_utilisable'
        ]
        read_only_fields = ['id', 'date_creation']


class AvisProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvisProduit
        fields = [
            'id', 'produit', 'client', 'note',
            'commentaire', 'date_creation', 'est_approuve'
        ]
        read_only_fields = ['id', 'date_creation']


class PromotionSerializer(serializers.ModelSerializer):
    est_valide = serializers.BooleanField(read_only=True)

    class Meta:
        model = Promotion
        fields = [
            'id', 'code', 'type', 'valeur',
            'description', 'date_debut', 'date_fin',
            'utilisation_max', 'utilisation_actuelle',
            'est_actif', 'est_valide'
        ]


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = [
            'id', 'client', 'produit', 'date_ajout'
        ]
        read_only_fields = ['id', 'date_ajout']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'nom', 'prenom', 'email',
            'telephone', 'sujet', 'message',
            'date_creation', 'est_lu', 'reponse',
            'date_reponse'
        ]
        read_only_fields = ['id', 'date_creation']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'client', 'type', 'titre',
            'message', 'lien', 'est_lu', 'date_creation'
        ]
        read_only_fields = ['id', 'date_creation']


class AdminLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin', 'action', 'model_name',
            'object_id', 'details', 'ip_address',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'site_name', 'site_description',
            'logo', 'favicon', 'contact_email',
            'contact_phone', 'contact_address',
            'facebook_url', 'instagram_url',
            'linkedin_url', 'twitter_url',
            'maintenance_mode', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']