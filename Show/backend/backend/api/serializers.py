# api/serializers.py
import re
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Coach, Forfait, Client, RendezVous, Evenement, ParticipationEvenement,
    Produit, ImageProduit, Panier, LignePanier, Commande, LigneCommande,
    RubriqueRelookingFemme, RubriqueRelookingHomme, RubriqueAtelier,
    FormationEnLigne, CodeAccesFormation, InscriptionFormation,
    MoyenPaiement, TransactionPaiement, AvisProduit, Promotion,
    Wishlist, Actualite, FAQ, Newsletter, ContactMessage,
    Notification, AdminLog, SiteSettings, OTPCode, InscriptionRelooking
)


# =============================================
# ✅ VALIDATEURS RÉUTILISABLES (mixins)
# =============================================

class PhoneValidationMixin:
    """Mixin pour valider un numéro de téléphone."""

    def validate_telephone(self, value):
        """Valide et normalise un numéro de téléphone."""
        if not value:
            raise serializers.ValidationError(
                "Le numéro de téléphone est obligatoire."
            )

        chiffres = re.sub(r'\D', '', str(value))

        if len(chiffres) < 8:
            raise serializers.ValidationError(
                "Le numéro doit contenir au moins 8 chiffres."
            )
        if len(chiffres) > 15:
            raise serializers.ValidationError(
                "Le numéro ne doit pas dépasser 15 chiffres."
            )

        # ✅ Accepte : 0XXXXXXXXX (CI), +225XXXXXXXXXX, formats internationaux
        if not re.match(r'^(?:\+?\d{1,3})?0?\d{8,14}$', chiffres):
            raise serializers.ValidationError(
                "Format de téléphone invalide."
            )

        return chiffres


class NameValidationMixin:
    """Mixin pour valider nom/prénom."""

    def _validate_name(self, value, label):
        if not value or not str(value).strip():
            raise serializers.ValidationError(f"{label} est obligatoire.")

        value = str(value).strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                f"{label} doit contenir au moins 2 caractères."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                f"{label} ne doit pas dépasser 50 caractères."
            )
        if not re.match(r"^[a-zA-ZÀ-ÿ\s\-']+$", value):
            raise serializers.ValidationError(
                f"{label} ne doit contenir que des lettres."
            )

        return value

    def validate_nom(self, value):
        return self._validate_name(value, "Le nom")

    def validate_prenom(self, value):
        return self._validate_name(value, "Le prénom")


class EmailValidationMixin:
    """Mixin pour valider un email."""

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("L'email est obligatoire.")

        value = str(value).strip().lower()

        if len(value) > 254:
            raise serializers.ValidationError("L'email est trop long.")

        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Format d'email invalide.")

        return value


# =============================================
# ✅ AUTHENTIFICATION & UTILISATEURS
# =============================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'is_superuser']


class ClientSerializer(NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer):
    """Serializer pour afficher un client. Password JAMAIS exposé."""
    user_data = UserSerializer(source='user', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'user', 'user_data', 'nom', 'prenom', 'full_name',
            'email', 'telephone', 'adresse', 'created_at', 'updated_at'
            # ✅ 'password' volontairement retiré
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"


class ClientRegisterSerializer(NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer):
    """Serializer pour l'inscription d'un client avec mot de passe"""
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=128,
        style={'input_type': 'password'},
        error_messages={
            'min_length': 'Le mot de passe doit contenir au moins 8 caractères.',
            'max_length': 'Le mot de passe ne doit pas dépasser 128 caractères.',
        }
    )

    class Meta:
        model = Client
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'password']
        extra_kwargs = {
            'adresse': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        """Vérifie l'unicité de l'email."""
        value = super().validate_email(value)
        if Client.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Un compte avec cet email existe déjà."
            )
        return value

    def validate_password(self, value):
        """Vérifie la robustesse du mot de passe."""
        if len(value) < 8:
            raise serializers.ValidationError(
                "Le mot de passe doit contenir au moins 8 caractères."
            )
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError(
                "Le mot de passe doit contenir au moins une lettre."
            )
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                "Le mot de passe doit contenir au moins un chiffre."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        client = Client.objects.create(**validated_data)
        client.set_password(password)  # ✅ Hachage
        client.save()
        return client


class ClientLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion d'un client"""
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(max_length=128, style={'input_type': 'password'})

    def validate_email(self, value):
        return value.strip().lower()


class OTPCodeSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()

    class Meta:
        model = OTPCode
        fields = ['id', 'email', 'code', 'created_at', 'expires_at', 'is_used', 'is_valid']
        read_only_fields = ['id', 'created_at', 'expires_at', 'is_used']


# =============================================
# ✅ COACH & FORFAITS
# =============================================

class CoachSerializer(NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer):
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
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo:
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def get_full_name(self, obj):
        return f"{obj.prenom} {obj.nom}"

    def validate_bio(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("La bio ne doit pas dépasser 2000 caractères.")
        return value


class ForfaitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forfait
        fields = '__all__'

    def validate_prix(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value


# =============================================
# ✅ RENDEZ-VOUS
# =============================================

class RendezVousSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    coach_name = serializers.CharField(source='coach.full_name', read_only=True)

    class Meta:
        model = RendezVous
        fields = '__all__'
        read_only_fields = ['id']

    def validate_date_rendez_vous(self, value):
        """Vérifie que le rendez-vous n'est pas dans le passé."""
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "Le rendez-vous ne peut pas être dans le passé."
            )
        return value


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
        read_only_fields = ['id', 'places_restantes', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_est_complet(self, obj):
        return obj.places_restantes <= 0

    def validate_titre(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères.")
        if len(value) > 200:
            raise serializers.ValidationError("Le titre ne doit pas dépasser 200 caractères.")
        return value.strip()

    def validate_places_total(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("Le nombre de places doit être au moins 1.")
        if value is not None and value > 100000:
            raise serializers.ValidationError("Le nombre de places est trop élevé.")
        return value

    def validate_prix(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value

    def validate(self, data):
        """Vérifie la cohérence des dates."""
        date_debut = data.get('date_debut') or getattr(self.instance, 'date_debut', None)
        date_fin = data.get('date_fin') or getattr(self.instance, 'date_fin', None)

        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError(
                {'date_fin': "La date de fin doit être postérieure ou égale à la date de début."}
            )
        return data


class ParticipationEvenementSerializer(
    NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer
):
    """Serializer de participation à un événement."""
    client_details = ClientSerializer(source='client', read_only=True)
    evenement_details = EvenementSerializer(source='evenement', read_only=True)

    nom = serializers.CharField(write_only=True, required=False)
    prenom = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    telephone = serializers.CharField(write_only=True, required=False)
    nombre_places = serializers.IntegerField(write_only=True, required=False, default=1)
    message = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ParticipationEvenement
        fields = [
            'id', 'evenement', 'evenement_details', 'client', 'client_details',
            'date_inscription', 'statut', 'notes',
            'nom', 'prenom', 'email', 'telephone', 'nombre_places', 'message',
        ]
        read_only_fields = ['id', 'client', 'date_inscription', 'statut']

    def validate_nombre_places(self, value):
        if value < 1:
            raise serializers.ValidationError("Minimum 1 place.")
        if value > 20:
            raise serializers.ValidationError("Maximum 20 places par inscription.")
        return value

    def validate_message(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Le message ne doit pas dépasser 500 caractères.")
        return value.strip() if value else ''

    def validate_notes(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Les notes ne doivent pas dépasser 500 caractères.")
        return value.strip() if value else ''

    def validate(self, data):
        """Vérifie que l'événement existe et a des places disponibles."""
        evenement = data.get('evenement') or getattr(self.instance, 'evenement', None)

        if not evenement:
            raise serializers.ValidationError({'evenement': "L'événement est requis."})

        if evenement.places_restantes <= 0:
            raise serializers.ValidationError({'evenement': "Cet événement est complet."})

        nombre_places = data.get('nombre_places', 1)
        if nombre_places > evenement.places_restantes:
            raise serializers.ValidationError({
                'nombre_places': f"Seulement {evenement.places_restantes} place(s) restante(s)."
            })

        return data


# =============================================
# ✅ PRODUITS & BOUTIQUE
# =============================================

class ImageProduitSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ImageProduit
        fields = ['id', 'image', 'image_url', 'ordre']
        read_only_fields = ['id']

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
        read_only_fields = ['id', 'note', 'nb_avis', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image_principale:
            if request:
                return request.build_absolute_uri(obj.image_principale.url)
            return obj.image_principale.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"

    def validate_nom(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères.")
        if len(value) > 200:
            raise serializers.ValidationError("Le nom ne doit pas dépasser 200 caractères.")
        return value.strip()

    def validate_prix(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        if value is not None and value > 100_000_000:
            raise serializers.ValidationError("Le prix est trop élevé.")
        return value

    def validate_prix_promotion(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix promotionnel ne peut pas être négatif.")
        return value

    def validate_quantite_stock(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("La quantité en stock ne peut pas être négative.")
        return value

    def validate(self, data):
        """Vérifie que le prix promo est inférieur au prix normal."""
        prix = data.get('prix') or getattr(self.instance, 'prix', None)
        prix_promo = data.get('prix_promotion') or getattr(self.instance, 'prix_promotion', None)

        if prix and prix_promo and prix_promo >= prix:
            raise serializers.ValidationError({
                'prix_promotion': "Le prix promotionnel doit être inférieur au prix normal."
            })
        return data


class AvisProduitSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = AvisProduit
        fields = [
            'id', 'produit', 'client', 'client_name', 'note',
            'commentaire', 'date_creation', 'date_formatee', 'est_approuve'
        ]
        read_only_fields = ['id', 'client', 'date_creation', 'est_approuve']

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y')

    def validate_note(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value

    def validate_commentaire(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Le commentaire ne doit pas dépasser 1000 caractères.")
        return value.strip() if value else ''


# =============================================
# ✅ PANIER & COMMANDES
# =============================================

class LignePanierSerializer(serializers.ModelSerializer):
    sous_total = serializers.ReadOnlyField()
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_prix = serializers.DecimalField(source='produit.prix', read_only=True, max_digits=10, decimal_places=2)
    produit_image = serializers.SerializerMethodField()
    produit_stock = serializers.IntegerField(source='produit.quantite_stock', read_only=True)

    class Meta:
        model = LignePanier
        fields = [
            'id', 'produit', 'produit_nom', 'produit_prix', 'produit_image',
            'produit_stock', 'quantite', 'prix_unitaire', 'sous_total'
        ]
        read_only_fields = ['id', 'prix_unitaire', 'sous_total']

    def get_produit_image(self, obj):
        request = self.context.get('request')
        if obj.produit and obj.produit.image_principale:
            if request:
                return request.build_absolute_uri(obj.produit.image_principale.url)
            return obj.produit.image_principale.url
        return None

    def validate_quantite(self, value):
        if value < 1:
            raise serializers.ValidationError("La quantité doit être au moins 1.")
        if value > 100:
            raise serializers.ValidationError("La quantité ne peut pas dépasser 100.")
        return value


class PanierSerializer(serializers.ModelSerializer):
    lignes = LignePanierSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    total_articles = serializers.SerializerMethodField()

    class Meta:
        model = Panier
        fields = ['id', 'client', 'lignes', 'total', 'total_articles', 'est_valide', 'date_creation']
        read_only_fields = ['id', 'client', 'date_creation']

    def get_total(self, obj):
        return sum(ligne.sous_total for ligne in obj.lignes.all())

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
        read_only_fields = ['id', 'prix_unitaire', 'sous_total']

    def get_produit_image(self, obj):
        request = self.context.get('request')
        if obj.produit and obj.produit.image_principale:
            if request:
                return request.build_absolute_uri(obj.produit.image_principale.url)
            return obj.produit.image_principale.url
        return None


class CommandeSerializer(PhoneValidationMixin, serializers.ModelSerializer):
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
        read_only_fields = ['id', 'client', 'date_commande', 'total', 'statut']

    def get_total_formate(self, obj):
        return f"{int(obj.total)} CFA"

    def validate_adresse_livraison(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("L'adresse doit contenir au moins 5 caractères.")
        if len(value) > 500:
            raise serializers.ValidationError("L'adresse ne doit pas dépasser 500 caractères.")
        return value.strip()

    def validate_ville(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("La ville est obligatoire.")
        if len(value) > 100:
            raise serializers.ValidationError("La ville ne doit pas dépasser 100 caractères.")
        return value.strip()

    def validate_code_postal(self, value):
        if value and not re.match(r'^\d{4,10}$', str(value)):
            raise serializers.ValidationError("Le code postal doit contenir 4 à 10 chiffres.")
        return value


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
        read_only_fields = ['id', 'note', 'nb_avis', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_note_formatee(self, obj):
        return f"{obj.note}/5"

    def validate_prix(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value


class RubriqueRelookingHommeSerializer(RubriqueRelookingFemmeSerializer):
    class Meta(RubriqueRelookingFemmeSerializer.Meta):
        model = RubriqueRelookingHomme


class RubriqueAtelierSerializer(RubriqueRelookingFemmeSerializer):
    places_display = serializers.ReadOnlyField()

    class Meta(RubriqueRelookingFemmeSerializer.Meta):
        model = RubriqueAtelier
        fields = RubriqueRelookingFemmeSerializer.Meta.fields + [
            'nb_personnes_min', 'nb_personnes_max', 'places_display'
        ]

    def validate(self, data):
        min_p = data.get('nb_personnes_min') or getattr(self.instance, 'nb_personnes_min', None)
        max_p = data.get('nb_personnes_max') or getattr(self.instance, 'nb_personnes_max', None)

        if min_p and max_p and min_p > max_p:
            raise serializers.ValidationError({
                'nb_personnes_max': "Le maximum doit être supérieur ou égal au minimum."
            })
        return data


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
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_titre(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères.")
        if len(value) > 200:
            raise serializers.ValidationError("Le titre ne doit pas dépasser 200 caractères.")
        return value.strip()

    def validate_prix(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value

    def validate_video_url(self, value):
        if value and not re.match(r'^https?://', value):
            raise serializers.ValidationError("L'URL vidéo doit commencer par http:// ou https://.")
        return value

    def validate_replay_url(self, value):
        if value and not re.match(r'^https?://', value):
            raise serializers.ValidationError("L'URL replay doit commencer par http:// ou https://.")
        return value


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
        read_only_fields = [
            'id', 'code', 'date_creation', 'date_utilisation',
            'est_valide', 'est_utilisable'
        ]


class InscriptionFormationSerializer(
    NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer
):
    """Inscription à une formation en ligne."""
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    formation_titre = serializers.CharField(source='formation.titre', read_only=True)
    client_details = ClientSerializer(source='client', read_only=True)
    formation_details = FormationEnLigneSerializer(source='formation', read_only=True)

    nom = serializers.CharField(write_only=True, required=False)
    prenom = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    telephone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = InscriptionFormation
        fields = [
            'id', 'formation', 'formation_titre', 'formation_details',
            'client', 'client_name', 'client_details',
            'code_acces', 'statut', 'date_inscription', 'montant',
            'reference_paiement', 'notes',
            'nom', 'prenom', 'email', 'telephone',
        ]
        read_only_fields = [
            'id', 'client', 'code_acces', 'statut',
            'date_inscription', 'montant', 'reference_paiement'
        ]

    def validate_notes(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Les notes ne doivent pas dépasser 500 caractères.")
        return value.strip() if value else ''


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
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo:
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def validate_nom(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères.")
        return value.strip()


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
        read_only_fields = [
            'id', 'reference', 'statut', 'date_creation',
            'date_validation', 'numero_transaction'
        ]

    def get_montant_formate(self, obj):
        return f"{int(obj.montant)} CFA"

    def validate_montant(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        if value > 100_000_000:
            raise serializers.ValidationError("Le montant est trop élevé.")
        return value


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
        read_only_fields = ['id', 'utilisation_actuelle', 'est_valide']

    def validate_code(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Le code doit contenir au moins 3 caractères.")
        if len(value) > 50:
            raise serializers.ValidationError("Le code ne doit pas dépasser 50 caractères.")
        if not re.match(r'^[A-Z0-9_-]+$', value):
            raise serializers.ValidationError("Le code ne doit contenir que des majuscules, chiffres, - et _.")
        return value.strip().upper()

    def validate_valeur(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("La valeur doit être supérieure à 0.")
        return value

    def validate(self, data):
        date_debut = data.get('date_debut') or getattr(self.instance, 'date_debut', None)
        date_fin = data.get('date_fin') or getattr(self.instance, 'date_fin', None)

        if date_debut and date_fin and date_fin <= date_debut:
            raise serializers.ValidationError({
                'date_fin': "La date de fin doit être postérieure à la date de début."
            })
        return data


class WishlistSerializer(serializers.ModelSerializer):
    produit_data = ProduitSerializer(source='produit', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'client', 'produit', 'produit_data', 'date_ajout']
        read_only_fields = ['id', 'client', 'date_ajout']


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
        read_only_fields = ['id', 'slug', 'vues', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_date_formatee(self, obj):
        return obj.date_publication.strftime('%d %B %Y')

    def validate_titre(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères.")
        if len(value) > 200:
            raise serializers.ValidationError("Le titre ne doit pas dépasser 200 caractères.")
        return value.strip()


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'reponse', 'categorie', 'ordre', 'est_actif']
        read_only_fields = ['id']

    def validate_question(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("La question doit contenir au moins 5 caractères.")
        return value.strip()

    def validate_reponse(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("La réponse doit contenir au moins 5 caractères.")
        return value.strip()


class NewsletterSerializer(EmailValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'date_abonnement', 'est_actif']
        read_only_fields = ['id', 'date_abonnement']

    def validate_email(self, value):
        value = super().validate_email(value)
        if Newsletter.objects.filter(email=value, est_actif=True).exists():
            raise serializers.ValidationError("Cet email est déjà abonné à la newsletter.")
        return value


# =============================================
# ✅ CONTACT & NOTIFICATIONS
# =============================================

class ContactMessageSerializer(NameValidationMixin, PhoneValidationMixin, EmailValidationMixin, serializers.ModelSerializer):
    sujet_display = serializers.CharField(source='get_sujet_display', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessage
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'sujet',
            'sujet_display', 'message', 'date_creation', 'date_formatee',
            'est_lu', 'reponse', 'date_reponse'
        ]
        read_only_fields = ['id', 'date_creation', 'est_lu', 'reponse', 'date_reponse']

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y à %H:%M')

    def validate_message(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Le message doit contenir au moins 10 caractères.")
        if len(value) > 2000:
            raise serializers.ValidationError("Le message ne doit pas dépasser 2000 caractères.")
        return value.strip()


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    date_formatee = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'client', 'type', 'type_display', 'titre', 'message',
            'lien', 'est_lu', 'date_creation', 'date_formatee'
        ]
        read_only_fields = ['id', 'client', 'date_creation']

    def get_date_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y à %H:%M')

    def validate_titre(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères.")
        return value.strip()

    def validate_message(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Le message doit contenir au moins 5 caractères.")
        if len(value) > 500:
            raise serializers.ValidationError("Le message ne doit pas dépasser 500 caractères.")
        return value.strip()


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
        read_only_fields = '__all__'

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
        read_only_fields = ['id', 'created_at', 'updated_at']

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

    def validate_contact_email(self, value):
        if value:
            try:
                validate_email(value)
            except DjangoValidationError:
                raise serializers.ValidationError("Format d'email invalide.")
        return value

    def validate_contact_phone(self, value):
        if value:
            chiffres = re.sub(r'\D', '', str(value))
            if len(chiffres) < 8 or len(chiffres) > 15:
                raise serializers.ValidationError("Le téléphone doit contenir entre 8 et 15 chiffres.")
            return chiffres
        return value


# =============================================
# ✅ INSCRIPTION RELOOKING
# =============================================

class InscriptionRelookingSerializer(
    NameValidationMixin,
    PhoneValidationMixin,
    EmailValidationMixin,
    serializers.ModelSerializer
):
    class Meta:
        model = InscriptionRelooking
        fields = '__all__'
        read_only_fields = ['id']

    def validate(self, data):
        """
        Validation globale.
        ⚠️ En PATCH (partial=True), on ne valide QUE les champs envoyés.
        On utilise `self.instance` pour récupérer les valeurs existantes.
        """
        required_fields = ['nom', 'prenom', 'email', 'telephone']

        for field in required_fields:
            if field not in self.fields:
                continue

            value_from_data = data.get(field)
            value_from_instance = (
                getattr(self.instance, field, None) if self.instance else None
            )

            value = value_from_data if value_from_data is not None else value_from_instance

            if not value:
                raise serializers.ValidationError({
                    field: f"Le champ {field} est obligatoire."
                })

        return data