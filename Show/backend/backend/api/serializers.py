# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

# ========== SÉRIALIZERS POUR L'AUTHENTIFICATION ==========

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

# ========== SÉRIALIZERS POUR LE COACH ==========

class CoachSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Coach
        fields = [
            'id', 'user', 'nom', 'prenom', 'nom_complet', 'bio', 'photo',
            'email', 'telephone', 'specialites', 'experience',
            'facebook', 'instagram', 'linkedin', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"

class CoachSimpleSerializer(serializers.ModelSerializer):
    """Version simplifiée pour les listes"""
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Coach
        fields = ['id', 'nom_complet', 'photo', 'specialites', 'experience']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"

# ========== SÉRIALIZERS POUR LES FORFAITS ==========

class ForfaitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forfait
        fields = [
            'id', 'nom', 'type', 'description', 'prix', 
            'duree', 'nb_seances', 'caracteristiques', 
            'est_actif', 'created_at'
        ]
        read_only_fields = ['created_at']

# ========== SÉRIALIZERS POUR LES CLIENTS ==========

class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nom_complet = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'user', 'nom', 'prenom', 'nom_complet', 
            'email', 'telephone', 'date_naissance', 'age',
            'adresse', 'photo', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"
    
    def get_age(self, obj):
        if obj.date_naissance:
            from datetime import date
            today = date.today()
            return today.year - obj.date_naissance.year - (
                (today.month, today.day) < (obj.date_naissance.month, obj.date_naissance.day)
            )
        return None

class ClientCreateSerializer(serializers.ModelSerializer):
    user = UserCreateSerializer()
    
    class Meta:
        model = Client
        fields = [
            'user', 'nom', 'prenom', 'email', 'telephone', 
            'date_naissance', 'adresse', 'photo'
        ]
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserCreateSerializer().create(user_data)
        client = Client.objects.create(user=user, **validated_data)
        return client

# ========== SÉRIALIZERS POUR LES RENDEZ-VOUS ==========

class RendezVousSerializer(serializers.ModelSerializer):
    client_nom = serializers.SerializerMethodField()
    coach_nom = serializers.SerializerMethodField()
    forfait_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'client', 'client_nom', 'coach', 'coach_nom',
            'forfait', 'forfait_nom', 'date_rendez_vous', 
            'duree', 'statut', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"
    
    def get_coach_nom(self, obj):
        return f"{obj.coach.prenom} {obj.coach.nom}"
    
    def get_forfait_nom(self, obj):
        return obj.forfait.nom

class RendezVousCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = [
            'client', 'coach', 'forfait', 'date_rendez_vous',
            'duree', 'notes'
        ]
    
    def validate(self, data):
        # Vérifier que la date n'est pas dans le passé
        from django.utils import timezone
        if data['date_rendez_vous'] < timezone.now():
            raise serializers.ValidationError(
                "La date du rendez-vous ne peut pas être dans le passé"
            )
        return data

# ========== SÉRIALIZERS POUR LES ÉVÉNEMENTS ==========

class EvenementSerializer(serializers.ModelSerializer):
    places_restantes_affichage = serializers.SerializerMethodField()
    est_complet = serializers.SerializerMethodField()
    pourcentage_remplissage = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'theme', 'description', 
            'date_debut', 'date_fin', 'lieu',
            'places_total', 'places_restantes', 'places_restantes_affichage',
            'est_complet', 'pourcentage_remplissage',
            'prix', 'image', 'statut', 'est_gratuit',
            'created_at'
        ]
        read_only_fields = ['created_at', 'places_restantes']
    
    def get_places_restantes_affichage(self, obj):
        return f"{obj.places_restantes} / {obj.places_total}"
    
    def get_est_complet(self, obj):
        return obj.places_restantes == 0
    
    def get_pourcentage_remplissage(self, obj):
        if obj.places_total == 0:
            return 0
        return int(((obj.places_total - obj.places_restantes) / obj.places_total) * 100)

class EvenementDetailSerializer(EvenementSerializer):
    """Sérializer détaillé pour un événement spécifique"""
    participants_count = serializers.SerializerMethodField()
    participants_recents = serializers.SerializerMethodField()
    
    class Meta(EvenementSerializer.Meta):
        fields = EvenementSerializer.Meta.fields + [
            'participants_count', 'participants_recents'
        ]
    
    def get_participants_count(self, obj):
        return ParticipationEvenement.objects.filter(
            evenement=obj, 
            statut='INSCRIT'
        ).count()
    
    def get_participants_recents(self, obj):
        participations = ParticipationEvenement.objects.filter(
            evenement=obj
        ).order_by('-date_inscription')[:5]
        return [{
            'client': f"{p.client.prenom} {p.client.nom}",
            'date_inscription': p.date_inscription
        } for p in participations]

# ========== SÉRIALIZERS POUR LES PARTICIPATIONS ==========

class ParticipationEvenementSerializer(serializers.ModelSerializer):
    client_nom = serializers.SerializerMethodField()
    evenement_titre = serializers.SerializerMethodField()
    
    class Meta:
        model = ParticipationEvenement
        fields = [
            'id', 'evenement', 'evenement_titre', 'client', 
            'client_nom', 'date_inscription', 'statut', 'notes'
        ]
        read_only_fields = ['date_inscription']
    
    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"
    
    def get_evenement_titre(self, obj):
        return obj.evenement.titre

class ParticipationEvenementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipationEvenement
        fields = ['evenement', 'client', 'notes']
    
    def validate(self, data):
        evenement = data['evenement']
        
        # Vérifier s'il reste des places
        if evenement.places_restantes <= 0:
            raise serializers.ValidationError(
                "Cet événement est complet, il n'y a plus de places disponibles"
            )
        
        # Vérifier si le client est déjà inscrit
        if ParticipationEvenement.objects.filter(
            evenement=evenement,
            client=data['client']
        ).exists():
            raise serializers.ValidationError(
                "Vous êtes déjà inscrit à cet événement"
            )
        
        return data

# ========== SÉRIALIZERS POUR LES PRODUITS ==========

class ProduitSerializer(serializers.ModelSerializer):
    prix_actuel = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    est_en_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'prix_actuel',
            'categorie', 'image_principale', 'images_secondaires',
            'taille', 'quantite_stock', 'est_en_stock',
            'est_disponible', 'est_en_promotion', 'prix_promotion',
            'model_3d_url', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_est_en_stock(self, obj):
        return obj.quantite_stock > 0 and obj.est_disponible

class ProduitDetailSerializer(ProduitSerializer):
    """Sérializer détaillé pour un produit"""
    produits_similaires = serializers.SerializerMethodField()
    
    class Meta(ProduitSerializer.Meta):
        fields = ProduitSerializer.Meta.fields + ['produits_similaires']
    
    def get_produits_similaires(self, obj):
        produits = Produit.objects.filter(
            categorie=obj.categorie,
            est_disponible=True
        ).exclude(id=obj.id)[:4]
        return ProduitSerializer(produits, many=True).data

# ========== SÉRIALIZERS POUR LE PANIER ==========

class LignePanierSerializer(serializers.ModelSerializer):
    produit_nom = serializers.SerializerMethodField()
    produit_prix = serializers.SerializerMethodField()
    sous_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = LignePanier
        fields = [
            'id', 'produit', 'produit_nom', 'produit_prix',
            'quantite', 'prix_unitaire', 'sous_total'
        ]
    
    def get_produit_nom(self, obj):
        return obj.produit.nom
    
    def get_produit_prix(self, obj):
        return obj.produit.prix_actuel

class PanierSerializer(serializers.ModelSerializer):
    lignes = LignePanierSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    nombre_articles = serializers.SerializerMethodField()
    
    class Meta:
        model = Panier
        fields = [
            'id', 'client', 'lignes', 'total', 
            'nombre_articles', 'date_creation', 'est_valide'
        ]
        read_only_fields = ['date_creation']
    
    def get_total(self, obj):
        total = 0
        for ligne in obj.lignes.all():
            total += ligne.sous_total
        return total
    
    def get_nombre_articles(self, obj):
        return sum(ligne.quantite for ligne in obj.lignes.all())

# ========== SÉRIALIZERS POUR LES COMMANDES ==========

class LigneCommandeSerializer(serializers.ModelSerializer):
    produit_nom = serializers.SerializerMethodField()
    sous_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = LigneCommande
        fields = ['id', 'produit', 'produit_nom', 'quantite', 'prix_unitaire', 'sous_total']
    
    def get_produit_nom(self, obj):
        return obj.produit.nom

class CommandeSerializer(serializers.ModelSerializer):
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    client_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Commande
        fields = [
            'id', 'client', 'client_nom', 'date_commande', 
            'statut', 'total', 'adresse_livraison', 'notes', 'lignes'
        ]
        read_only_fields = ['date_commande', 'total']
    
    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"

class CommandeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commande
        fields = ['client', 'adresse_livraison', 'notes']



class RubriqueRelookingFemmeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.SerializerMethodField()
    
    class Meta:
        model = RubriqueRelookingFemme
        fields = [
            'id', 'nom', 'categorie', 'description', 'description_detail',
            'prix', 'prix_formate', 'duree', 'image', 'est_actif', 'ordre'
        ]
    
    def get_prix_formate(self, obj):
        return f"{obj.prix} CFA"

  # api/serializers.py - Ajoutez ces sérializers

class RubriqueRelookingHommeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.SerializerMethodField()
    categorie_label = serializers.SerializerMethodField()
    
    class Meta:
        model = RubriqueRelookingHomme
        fields = [
            'id', 'nom', 'categorie', 'categorie_label', 'description', 
            'description_detail', 'prix', 'prix_formate', 'duree', 
            'image', 'est_actif', 'ordre', 'note'
        ]
    
    def get_prix_formate(self, obj):
        return f"{obj.prix} CFA"
    
    def get_categorie_label(self, obj):
        labels = {
            'COACHING': 'Coaching Relooking',
            'BILAN': "Bilan d'Image",
            'SUBLIME': 'Relooking Sublime',
            'VINTAGE': 'Relooking Vintage',
        }
        return labels.get(obj.categorie, obj.categorie)


class RubriqueRelookingFemmeSerializer(serializers.ModelSerializer):
    prix_formate = serializers.SerializerMethodField()
    categorie_label = serializers.SerializerMethodField()
    
    class Meta:
        model = RubriqueRelookingFemme
        fields = [
            'id', 'nom', 'categorie', 'categorie_label', 'description', 
            'description_detail', 'prix', 'prix_formate', 'duree', 
            'image', 'est_actif', 'ordre', 'note'
        ]
    
    def get_prix_formate(self, obj):
        return f"{obj.prix} CFA"
    
    def get_categorie_label(self, obj):
        labels = {
            'COMPLET': 'Complet',
            'VISAGE': 'Visage',
            'VESTIMENTAIRE': 'Vestimentaire',
            'COIFFURE': 'Coiffure',
            'MAQUILLAGE': 'Maquillage',
            'SHOPPING': 'Personnel Shopping',
            'COLORIMETRIE': 'Analyse Colorimétrie',
        }
        return labels.get(obj.categorie, obj.categorie)


# api/serializers.py - Sérializer Atelier corrigé

class RubriqueAtelierSerializer(serializers.ModelSerializer):
    prix_formate = serializers.SerializerMethodField()
    categorie_label = serializers.SerializerMethodField()
    places_display = serializers.SerializerMethodField()
    
    class Meta:
        model = RubriqueAtelier
        fields = [
            'id', 'nom', 'categorie', 'categorie_label', 'description', 
            'description_detail', 'prix', 'prix_formate', 'duree',
            'nb_personnes_min', 'nb_personnes_max', 'places_display',
            'image', 'est_actif', 'ordre', 'note'
        ]
    
    def get_prix_formate(self, obj):
        return f"{obj.prix} CFA"
    
    def get_categorie_label(self, obj):
        labels = {
            'STYLE': 'Atelier Style et Élégance',
            'GROUPE': 'Atelier Relooking de Groupe',
            'MASTERCLASS': 'Masterclass Image et Confiance',
        }
        return labels.get(obj.categorie, obj.categorie)
    
    def get_places_display(self, obj):
        return f"{obj.nb_personnes_min} - {obj.nb_personnes_max} personnes"

# api/serializers.py

class FormationEnLigneSerializer(serializers.ModelSerializer):
    statut_label = serializers.SerializerMethodField()
    prix_formate = serializers.SerializerMethodField()
    est_live = serializers.SerializerMethodField()
    est_replay = serializers.SerializerMethodField()
    
    class Meta:
        model = FormationEnLigne
        fields = [
            'id', 'titre', 'description', 'description_detail', 'prix', 
            'prix_formate', 'duree', 'statut', 'statut_label', 
            'est_live', 'est_replay', 'date_live', 'image', 
            'video_url', 'replay_url', 'est_actif', 'ordre'
        ]
    
    def get_statut_label(self, obj):
        labels = {
            'PROGRAMME': 'Programmé',
            'LIVE': '🔴 En direct',
            'REPLAY': '📺 Replay disponible',
            'TERMINE': 'Terminé',
        }
        return labels.get(obj.statut, obj.statut)
    
    def get_prix_formate(self, obj):
        return f"{obj.prix} CFA"
    
    def get_est_live(self, obj):
        return obj.statut == 'LIVE'
    
    def get_est_replay(self, obj):
        return obj.statut == 'REPLAY'


class CodeAccesFormationSerializer(serializers.ModelSerializer):
    est_valide = serializers.SerializerMethodField()
    est_utilisable = serializers.SerializerMethodField()
    
    class Meta:
        model = CodeAccesFormation
        fields = [
            'id', 'code', 'statut', 'date_creation', 'date_utilisation',
            'date_expiration', 'est_valide', 'est_utilisable'
        ]
    
    def get_est_valide(self, obj):
        return obj.est_valide
    
    def get_est_utilisable(self, obj):
        return obj.est_utilisable


class InscriptionFormationSerializer(serializers.ModelSerializer):
    formation_titre = serializers.SerializerMethodField()
    client_nom = serializers.SerializerMethodField()
    code_acces = CodeAccesFormationSerializer(read_only=True)
    
    class Meta:
        model = InscriptionFormation
        fields = [
            'id', 'formation', 'formation_titre', 'client', 'client_nom',
            'code_acces', 'statut', 'date_inscription', 'montant',
            'reference_paiement', 'notes'
        ]
    
    def get_formation_titre(self, obj):
        return obj.formation.titre
    
    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"


class InscriptionFormationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscriptionFormation
        fields = ['formation', 'client', 'notes']
    
    def validate(self, data):
        formation = data['formation']
        client = data['client']
        
        # Vérifier si déjà inscrit
        if InscriptionFormation.objects.filter(
            formation=formation,
            client=client,
            statut__in=['EN_ATTENTE', 'PAYEE']
        ).exists():
            raise serializers.ValidationError(
                "Vous êtes déjà inscrit à cette formation"
            )
        
        return data



class MoyenPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoyenPaiement
        fields = ['id', 'nom', 'type', 'logo', 'est_actif']


class TransactionPaiementSerializer(serializers.ModelSerializer):
    moyen_paiement_nom = serializers.SerializerMethodField()
    inscription_formation = serializers.SerializerMethodField()
    
    class Meta:
        model = TransactionPaiement
        fields = [
            'id', 'inscription', 'inscription_formation', 'moyen_paiement',
            'moyen_paiement_nom', 'montant', 'reference', 'statut',
            'numero_transaction', 'date_creation', 'date_validation'
        ]
    
    def get_moyen_paiement_nom(self, obj):
        return obj.moyen_paiement.nom if obj.moyen_paiement else None
    
    def get_inscription_formation(self, obj):
        return obj.inscription.formation.titre


class TransactionPaiementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionPaiement
        fields = ['inscription', 'moyen_paiement', 'montant', 'numero_transaction', 'details']
    
    def create(self, validated_data):
        # Générer une référence unique
        import secrets
        reference = f"PAY-{secrets.token_hex(8).upper()}"
        validated_data['reference'] = reference
        validated_data['statut'] = 'EN_COURS'
        return super().create(validated_data)
    