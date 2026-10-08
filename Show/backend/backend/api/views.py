# =============================================
# ✅ IMPORTS (nettoyés, sans doublons)
# =============================================
import base64
import json
import random
import re
import secrets
import string
import traceback
from datetime import datetime, timedelta
from io import BytesIO
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ImageProduit   # ⬅️ Vérifie qu'il est importé
import qrcode
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    AdminLog,
    Actualite,
    AvisProduit,
    Client,
    Coach,
    CodeAccesFormation,
    Commande,
    ContactMessage,
    Evenement,
    FAQ,
    Forfait,
    FormationEnLigne,
    InscriptionFormation,
    InscriptionRelooking,
    LigneCommande,
    LignePanier,
    MoyenPaiement,
    Notification,
    Panier,
    ParticipationEvenement,
    Produit,
    Promotion,
    RendezVous,
    RubriqueAtelier,
    RubriqueRelookingFemme,
    RubriqueRelookingHomme,
    SiteSettings,
    TransactionPaiement,
    Wishlist,
)
from .serializers import (
    ActualiteSerializer,
    AdminLogSerializer,
    AvisProduitSerializer,
    ClientLoginSerializer,
    ClientRegisterSerializer,
    ClientSerializer,
    CoachSerializer,
    CodeAccesFormationSerializer,
    CommandeSerializer,
    ContactMessageSerializer,
    EvenementSerializer,
    FAQSerializer,
    ForfaitSerializer,
    FormationEnLigneSerializer,
    InscriptionFormationSerializer,
    InscriptionRelookingSerializer,
    LignePanierSerializer,
    MoyenPaiementSerializer,
    NotificationSerializer,
    PanierSerializer,
    ParticipationEvenementSerializer,
    ProduitSerializer,
    PromotionSerializer,
    RendezVousSerializer,
    RubriqueAtelierSerializer,
    RubriqueRelookingFemmeSerializer,
    RubriqueRelookingHommeSerializer,
    SiteSettingsSerializer,
    TransactionPaiementSerializer,
    WishlistSerializer,
)
from .utils import envoyer_sms_confirmation


# =============================================
# ✅ HELPERS D'AUTHENTIFICATION CLIENT
# =============================================
# Ton modèle Client n'a pas de FK vers User, donc on utilise un système
# de token simple stocké sur le client. À adapter si tu ajoutes un FK.

def get_client_from_request(request):
    """
    Récupère le Client authentifié à partir du header X-Client-Token.
    Retourne None si absent ou invalide.
    """
    token = request.headers.get('X-Client-Token') or request.META.get('HTTP_X_CLIENT_TOKEN')
    if not token:
        return None
    try:
        return Client.objects.get(api_token=token, api_token_active=True)
    except Client.DoesNotExist:
        return None


def require_client(request, client_id):
    """
    Vérifie que le client authentifié correspond au client_id demandé.
    Retourne (client, error_response).
    """
    client = get_client_from_request(request)
    if client is None:
        return None, Response(
            {'error': 'Authentification client requise.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if str(client.id) != str(client_id):
        return None, Response(
            {'error': 'Accès refusé à ce client.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    return client, None


# =============================================
# ✅ VUES JWT POUR L'AUTHENTIFICATION ADMIN/STAFF
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainView(APIView):
    """
    Vue pour obtenir un token JWT (admin/staff).
    CSRF exempté car l'auth est basée sur JWT (pas de session).
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # Pas d'auth requise pour se connecter

    def post(self, request):
        try:
            if request.content_type and 'application/json' in request.content_type:
                data = json.loads(request.body)
            else:
                data = request.POST

            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return Response(
                    {'error': "Nom d'utilisateur et mot de passe requis"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = authenticate(username=username, password=password)

            if user is None:
                return Response(
                    {'error': 'Identifiants incorrects'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                },
            })

        except json.JSONDecodeError:
            return Response(
                {'error': 'Format JSON invalide'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenRefreshView(APIView):
    """
    Rafraîchit un token JWT.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            if request.content_type and 'application/json' in request.content_type:
                data = json.loads(request.body)
            else:
                data = request.POST

            refresh_token = data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Token de rafraîchissement requis'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                refresh = RefreshToken(refresh_token)
                return Response({'access': str(refresh.access_token)})
            except TokenError:
                return Response(
                    {'error': 'Token invalide ou expiré'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(APIView):
    """
    Récupère l'utilisateur admin/staff connecté (via JWT).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })


# =============================================
# ✅ VUES PUBLIQUES : OTP & INSCRIPTION
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class RequestOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        # TODO: logique de génération et envoi du code OTP
        return Response({'success': True, 'message': 'Code envoyé', 'email': email})


@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('otp')
        # TODO: logique de vérification du code
        return Response({'success': True, 'message': 'Code vérifié'})


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # TODO: logique d'inscription admin
        return Response({'success': True, 'message': 'Utilisateur créé'})


# =============================================
# ✅ VUES CLIENT (AUTH + PANIER)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class ClientRegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ClientRegisterSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.save()
            # Génère un token API pour ce client
            client.api_token = secrets.token_urlsafe(48)
            client.api_token_active = True
            client.save(update_fields=['api_token', 'api_token_active'])
            return Response(
                {
                    'success': True,
                    'client_id': client.id,
                    'api_token': client.api_token,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ClientLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ClientLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            client = Client.objects.get(email=email)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client non trouvé'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not client.check_password(password):
            return Response(
                {'error': 'Mot de passe incorrect'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # (Re)génère un token API à chaque login
        client.api_token = secrets.token_urlsafe(48)
        client.api_token_active = True
        client.save(update_fields=['api_token', 'api_token_active'])

        return Response({
            'success': True,
            'client': ClientSerializer(client).data,
            'api_token': client.api_token,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PanierView(APIView):
    """
    Panier du client connecté.
    ✅ Sécurisé : seul le client authentifié peut accéder à son propre panier.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def _get_panier(self, client):
        panier, _ = Panier.objects.get_or_create(client=client, est_valide=False)
        return panier

    def get(self, request, client_id):
        client, error = require_client(request, client_id)
        if error:
            return error

        panier = self._get_panier(client)
        serializer = PanierSerializer(panier, context={'request': request})
        return Response(serializer.data)

    def post(self, request, client_id):
        client, error = require_client(request, client_id)
        if error:
            return error

        panier = self._get_panier(client)
        produit_id = request.data.get('produit_id')
        try:
            quantite = int(request.data.get('quantite', 1))
        except (TypeError, ValueError):
            return Response({'error': 'Quantité invalide'}, status=status.HTTP_400_BAD_REQUEST)

        if quantite < 1:
            return Response({'error': 'Quantité minimale : 1'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        ligne, created = LignePanier.objects.get_or_create(
            panier=panier,
            produit=produit,
            defaults={'quantite': quantite, 'prix_unitaire': produit.prix},
        )
        if not created:
            ligne.quantite += quantite
            ligne.save(update_fields=['quantite'])

        return Response(
            PanierSerializer(panier, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, client_id):
        client, error = require_client(request, client_id)
        if error:
            return error

        ligne_id = request.data.get('ligne_id')
        if not ligne_id:
            return Response({'error': 'ligne_id requis'}, status=status.HTTP_400_BAD_REQUEST)

        panier = self._get_panier(client)
        LignePanier.objects.filter(id=ligne_id, panier=panier).delete()
        return Response(PanierSerializer(panier, context={'request': request}).data)


@method_decorator(csrf_exempt, name='dispatch')
class CommandeDepuisPanierView(APIView):
    """
    Transforme le panier du client connecté en commande.
    ✅ Sécurisé : seul le client authentifié peut commander pour lui-même.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, client_id):
        client, error = require_client(request, client_id)
        if error:
            return error

        try:
            panier = Panier.objects.filter(client=client, est_valide=False).first()
            if not panier or not panier.lignes.exists():
                return Response({'error': 'Panier vide'}, status=status.HTTP_400_BAD_REQUEST)

            total = sum(ligne.sous_total for ligne in panier.lignes.all())

            commande = Commande.objects.create(
                client=client,
                statut='EN_ATTENTE',
                total=total,
                adresse_livraison=request.data.get('adresse', ''),
                ville=request.data.get('ville', ''),
                code_postal=request.data.get('codePostal', ''),
                telephone=request.data.get('telephone', client.telephone or ''),
                notes=request.data.get('notes', ''),
            )

            for ligne in panier.lignes.all():
                LigneCommande.objects.create(
                    commande=commande,
                    produit=ligne.produit,
                    quantite=ligne.quantite,
                    prix_unitaire=ligne.prix_unitaire,
                )
                produit = ligne.produit
                produit.quantite_stock = max(0, produit.quantite_stock - ligne.quantite)
                produit.save(update_fields=['quantite_stock'])

            panier.est_valide = True
            panier.save(update_fields=['est_valide'])

            # Envoi SMS (best effort)
            try:
                for ligne in panier.lignes.all():
                    envoyer_sms_confirmation(client, commande, ligne.produit, ligne.quantite, total)
                    break  # un seul SMS pour la commande
            except Exception as e:
                print(f"❌ Erreur SMS: {e}")

            return Response(
                {'success': True, 'commande_id': commande.id, 'total': total},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ BASES VIEWSETS (permissions)
# =============================================

class PublicViewSet(viewsets.ModelViewSet):
    """
    Lecture publique, écriture admin uniquement.
    """
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class AdminOnlyViewSet(viewsets.ModelViewSet):
    """
    Réservé aux admins (lecture + écriture).
    """
    def get_permissions(self):
        return [IsAdminUser()]


# =============================================
# ✅ VIEWSETS PUBLICS
# =============================================

class FormationEnLigneViewSet(PublicViewSet):
    queryset = FormationEnLigne.objects.filter(est_actif=True)
    serializer_class = FormationEnLigneSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search) | Q(description__icontains=search)
            )
        return queryset.order_by('ordre', '-created_at')


class EvenementViewSet(PublicViewSet):
    queryset = Evenement.objects.filter(statut__in=['A_VENIR', 'EN_COURS'])
    serializer_class = EvenementSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search) |
                Q(description__icontains=search) |
                Q(theme__icontains=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()

            if 'places_total' in data:
                try:
                    data['places_restantes'] = int(data['places_total'])
                except (ValueError, TypeError):
                    return Response(
                        {'places_total': 'Le nombre de places doit être un nombre valide'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            if 'est_gratuit' in data:
                if data['est_gratuit'] in ['true', 'True', True, '1', 1]:
                    data['est_gratuit'] = True
                    data['prix'] = 0
                else:
                    data['est_gratuit'] = False

            if 'prix' in data:
                if data['prix'] in ('', None):
                    data['prix'] = 0
                try:
                    data['prix'] = float(data['prix'])
                except (ValueError, TypeError):
                    data['prix'] = 0

            if 'image' in request.FILES:
                data['image'] = request.FILES['image']

            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProduitViewSet(PublicViewSet):
    queryset = Produit.objects.filter(est_disponible=True).prefetch_related('images_secondaires')
    serializer_class = ProduitSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        queryset = super().get_queryset()
        categorie = self.request.query_params.get('categorie')
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        """
        ⚠️ Override nécessaire pour enregistrer les images secondaires.
        Le create() par défaut de DRF ne gère pas request.FILES.getlist().
        """
        # 1. Récupérer les images secondaires AVANT la création
        secondary_images = request.FILES.getlist('images_secondaires')

        # 2. Créer le produit normalement
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()

        # 3. Enregistrer les images secondaires
        for index, img in enumerate(secondary_images):
            ImageProduit.objects.create(
                produit=produit,
                image=img,
                ordre=index,
            )

        # 4. Ré-sérialiser pour renvoyer les images dans la réponse
        output_serializer = self.get_serializer(produit)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Idem pour update : enregistrer les nouvelles images secondaires.
        Les anciennes sont conservées (pas de suppression auto).
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        secondary_images = request.FILES.getlist('images_secondaires')

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        produit = serializer.save()

        # Ajouter les nouvelles images (sans supprimer les anciennes)
        for img in secondary_images:
            ImageProduit.objects.create(produit=produit, image=img)

        output_serializer = self.get_serializer(produit)
        return Response(output_serializer.data)


class ForfaitViewSet(PublicViewSet):
    queryset = Forfait.objects.filter(est_actif=True)
    serializer_class = ForfaitSerializer


class RubriqueRelookingFemmeViewSet(PublicViewSet):
    queryset = RubriqueRelookingFemme.objects.filter(est_actif=True)
    serializer_class = RubriqueRelookingFemmeSerializer


class RubriqueRelookingHommeViewSet(PublicViewSet):
    queryset = RubriqueRelookingHomme.objects.filter(est_actif=True)
    serializer_class = RubriqueRelookingHommeSerializer


class RubriqueAtelierViewSet(PublicViewSet):
    queryset = RubriqueAtelier.objects.filter(est_actif=True)
    serializer_class = RubriqueAtelierSerializer


class CoachViewSet(PublicViewSet):
    queryset = Coach.objects.all()
    serializer_class = CoachSerializer


class ActualiteViewSet(PublicViewSet):
    queryset = Actualite.objects.filter(est_publie=True)
    serializer_class = ActualiteSerializer


class FAQViewSet(PublicViewSet):
    queryset = FAQ.objects.filter(est_actif=True)
    serializer_class = FAQSerializer


class MoyenPaiementViewSet(PublicViewSet):
    queryset = MoyenPaiement.objects.filter(est_actif=True)
    serializer_class = MoyenPaiementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        type_paiement = self.request.query_params.get('type')
        if type_paiement:
            queryset = queryset.filter(type=type_paiement)
        return queryset.order_by('ordre')


# =============================================
# ✅ PAIEMENTS
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class PaiementViewSet(viewsets.ModelViewSet):
    """
    CREATE / GENERER_QR / CARTE : public
    LIST / RETRIEVE / UPDATE / DELETE : admin
    """
    queryset = TransactionPaiement.objects.all().order_by('-date_creation')
    serializer_class = TransactionPaiementSerializer

    def get_permissions(self):
        if self.action in ['create', 'generer_qr', 'carte']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def generer_qr(self, request):
        try:
            montant = request.data.get('montant')
            moyen_paiement_id = request.data.get('moyen_paiement')
            inscription_id = request.data.get('inscription')

            if not montant or not moyen_paiement_id:
                return Response(
                    {'error': 'Montant et moyen de paiement requis'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                moyen_paiement = MoyenPaiement.objects.get(id=moyen_paiement_id)
            except MoyenPaiement.DoesNotExist:
                return Response(
                    {'error': 'Moyen de paiement invalide'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reference = (
                f"QR-{datetime.now().strftime('%Y%m%d')}-"
                f"{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
            )

            expiration = timezone.now() + timedelta(seconds=60)
            qr_data = {
                'reference': reference,
                'montant': float(montant),
                'moyen_paiement': moyen_paiement_id,
                'moyen_paiement_nom': moyen_paiement.nom,
                'inscription': inscription_id,
                'date': timezone.now().isoformat(),
                'expiration': expiration.isoformat(),
            }

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

            transaction = TransactionPaiement.objects.create(
                reference=reference,
                montant=montant,
                moyen_paiement=moyen_paiement,
                statut='EN_ATTENTE',
                date_creation=timezone.now(),
                details={
                    'qr_code': True,
                    'inscription_id': inscription_id,
                    'expiration': expiration.isoformat(),
                },
            )

            return Response({
                'success': True,
                'qr_code': qr_base64,
                'reference': reference,
                'expiration': expiration.isoformat(),
                'transaction_id': transaction.id,
                'montant': float(montant),
                'moyen_paiement': moyen_paiement.nom,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def statut(self, request, pk=None):
        try:
            transaction = self.get_object()
            return Response({
                'statut': transaction.statut,
                'reference': transaction.reference,
                'montant': transaction.montant,
                'date_validation': transaction.date_validation,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def carte(self, request):
        try:
            data = request.data
            inscription_id = data.get('inscription')
            if not inscription_id:
                return Response({'error': 'Inscription requise'}, status=status.HTTP_400_BAD_REQUEST)

            inscription = get_object_or_404(InscriptionFormation, id=inscription_id)

            numero_carte = data.get('numero_carte', '')
            if len(numero_carte) < 16:
                return Response({'error': 'Numéro de carte invalide'}, status=status.HTTP_400_BAD_REQUEST)

            transaction = TransactionPaiement.objects.create(
                inscription=inscription,
                montant=inscription.montant,
                statut='REUSSI',
                reference=(
                    f"CRD-{datetime.now().strftime('%Y%m%d')}-"
                    f"{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                ),
                date_validation=timezone.now(),
                details={
                    'type': 'CARTE_BANCAIRE',
                    'titulaire': data.get('titulaire', ''),
                    'dernier_chiffres': numero_carte[-4:],
                },
            )

            inscription.statut = 'PAYEE'
            inscription.reference_paiement = transaction.reference
            inscription.save(update_fields=['statut', 'reference_paiement'])

            return Response({
                'success': True,
                'message': 'Paiement effectué avec succès',
                'reference': transaction.reference,
                'data': TransactionPaiementSerializer(transaction).data,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ INSCRIPTIONS FORMATION
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class InscriptionFormationViewSet(viewsets.ModelViewSet):
    """
    CREATE : public
    Le reste : admin
    """
    queryset = InscriptionFormation.objects.all()
    serializer_class = InscriptionFormationSerializer

    def get_permissions(self):
        if self.action in ['create', 'verifier_code']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset().select_related('client', 'formation', 'code_acces')
        formation_id = self.request.query_params.get('formation')
        if formation_id:
            queryset = queryset.filter(formation_id=formation_id)
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset.order_by('-date_inscription')

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            formation_id = data.get('formation')
            if not formation_id:
                return Response({'error': 'La formation est requise'}, status=status.HTTP_400_BAD_REQUEST)

            formation = get_object_or_404(FormationEnLigne, id=formation_id)

            email = data.get('email')
            if not email:
                return Response({'error': "L'email est requis"}, status=status.HTTP_400_BAD_REQUEST)

            client, _ = Client.objects.get_or_create(
                email=email,
                defaults={
                    'nom': data.get('nom', 'Client'),
                    'prenom': data.get('prenom', 'Inconnu'),
                    'telephone': data.get('telephone', ''),
                },
            )

            if InscriptionFormation.objects.filter(formation=formation, client=client).exists():
                return Response(
                    {'error': 'Vous êtes déjà inscrit à cette formation'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            inscription = InscriptionFormation.objects.create(
                formation=formation,
                client=client,
                statut='EN_ATTENTE',
                montant=formation.prix,
                notes=data.get('notes', ''),
            )

            serializer = self.get_serializer(inscription)
            return Response(
                {
                    'success': True,
                    'message': 'Inscription réussie',
                    'data': serializer.data,
                    'id': inscription.id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()

            data = {}
            for field in ['statut', 'notes']:
                if field in request.data:
                    data[field] = request.data[field]

            if 'statut' in data:
                valid = ['EN_ATTENTE', 'PAYEE', 'ANNULEE', 'REMBOURSEE']
                if data['statut'] not in valid:
                    return Response(
                        {'error': f'Statut invalide. Choisir parmi: {", ".join(valid)}'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = self.get_serializer(instance, data=data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def generer_code(self, request, pk=None):
        try:
            inscription = self.get_object()
            if inscription.statut != 'PAYEE':
                return Response(
                    {'error': "L'inscription doit être payée pour générer un code d'accès"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if inscription.code_acces:
                return Response({
                    'success': True,
                    'message': "Un code d'accès existe déjà",
                    'code': inscription.code_acces.code,
                    'data': CodeAccesFormationSerializer(inscription.code_acces).data,
                })

            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            code_acces = CodeAccesFormation.objects.create(
                formation=inscription.formation,
                client=inscription.client,
                code=code,
                date_expiration=timezone.now() + timedelta(days=30),
                montant_paye=inscription.montant,
                reference_paiement=inscription.reference_paiement or '',
            )
            inscription.code_acces = code_acces
            inscription.save(update_fields=['code_acces'])

            return Response({
                'success': True,
                'message': "Code d'accès généré avec succès",
                'code': code,
                'data': CodeAccesFormationSerializer(code_acces).data,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def verifier_code(self, request, pk=None):
        try:
            code = request.data.get('code')
            email = request.data.get('email')
            if not code or not email:
                return Response(
                    {'error': "Le code et l'email sont requis"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                code_acces = CodeAccesFormation.objects.get(
                    code=code, client__email=email, statut='ACTIF'
                )
            except CodeAccesFormation.DoesNotExist:
                return Response(
                    {'error': "Code d'accès invalide ou expiré"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if code_acces.date_expiration < timezone.now():
                code_acces.statut = 'EXPIRE'
                code_acces.save(update_fields=['statut'])
                return Response({'error': "Code d'accès expiré"}, status=status.HTTP_400_BAD_REQUEST)

            inscription = InscriptionFormation.objects.filter(
                code_acces=code_acces, statut='PAYEE'
            ).first()
            if not inscription:
                return Response({'error': 'Aucune inscription trouvée'}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'success': True,
                'message': 'Code valide',
                'formation': {
                    'id': inscription.formation.id,
                    'titre': inscription.formation.titre,
                    'video_url': inscription.formation.video_url,
                    'replay_url': inscription.formation.replay_url,
                },
                'client': {
                    'id': inscription.client.id,
                    'nom': inscription.client.nom,
                    'prenom': inscription.client.prenom,
                    'email': inscription.client.email,
                },
                'code_acces': code_acces.code,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def valider_paiement(self, request, pk=None):
        try:
            inscription = self.get_object()
            if inscription.statut == 'PAYEE':
                return Response(
                    {'success': False, 'message': 'Le paiement est déjà validé'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            inscription.statut = 'PAYEE'
            inscription.save(update_fields=['statut'])

            TransactionPaiement.objects.create(
                inscription=inscription,
                montant=inscription.montant,
                statut='REUSSI',
                reference=f"PAY-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                date_validation=timezone.now(),
                details={
                    'type': 'validation_manuelle',
                    'valide_par': request.user.username if request.user.is_authenticated else 'admin',
                },
            )

            return Response({
                'success': True,
                'message': 'Paiement validé avec succès',
                'data': self.get_serializer(inscription).data,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        try:
            inscription = self.get_object()
            if inscription.statut == 'ANNULEE':
                return Response(
                    {'success': False, 'message': "L'inscription est déjà annulée"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            inscription.statut = 'ANNULEE'
            inscription.save(update_fields=['statut'])
            return Response({
                'success': True,
                'message': 'Inscription refusée avec succès',
                'data': self.get_serializer(inscription).data,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ TRANSACTIONS PAIEMENT
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class TransactionPaiementViewSet(viewsets.ModelViewSet):
    queryset = TransactionPaiement.objects.all()
    serializer_class = TransactionPaiementSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            inscription_id = data.get('inscription')
            if not inscription_id:
                return Response({'error': "L'inscription est requise"}, status=status.HTTP_400_BAD_REQUEST)

            inscription = get_object_or_404(InscriptionFormation, id=inscription_id)

            transaction = TransactionPaiement.objects.create(
                inscription=inscription,
                moyen_paiement_id=data.get('moyen_paiement'),
                montant=inscription.montant,
                statut='EN_ATTENTE',
                reference=f"TXN-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                details=data.get('details', {}),
            )

            inscription.statut = 'PAYEE'
            inscription.reference_paiement = transaction.reference
            inscription.save(update_fields=['statut', 'reference_paiement'])

            if inscription.formation:
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                CodeAccesFormation.objects.create(
                    formation=inscription.formation,
                    client=inscription.client,
                    code=code,
                    date_expiration=timezone.now() + timedelta(days=30),
                    montant_paye=inscription.montant,
                    reference_paiement=transaction.reference,
                )

            serializer = self.get_serializer(transaction)
            return Response(
                {
                    'success': True,
                    'message': 'Paiement effectué avec succès',
                    'data': serializer.data,
                    'reference': transaction.reference,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ PARTICIPATION ÉVÉNEMENT
# =============================================

def valider_telephone(telephone):
    if not telephone:
        return None, "Le numéro de téléphone est obligatoire."
    chiffres = re.sub(r'\D', '', str(telephone))
    if len(chiffres) < 8:
        return None, "Le numéro de téléphone doit contenir au moins 8 chiffres."
    if len(chiffres) > 15:
        return None, "Le numéro de téléphone ne doit pas dépasser 15 chiffres."
    if not re.match(r'^0\d{9}$', chiffres):
        return None, "Format attendu : 10 chiffres commençant par 0 (ex: 0709871479)."
    return chiffres, None


def valider_email_format(email):
    if not email:
        return None, "L'adresse email est obligatoire."
    email = str(email).strip().lower()
    if len(email) > 254:
        return None, "L'adresse email est trop longue."
    try:
        validate_email(email)
    except DjangoValidationError:
        return None, "Format d'adresse email invalide."
    return email, None


def valider_nom_prenom(valeur, label="Le nom"):
    if not valeur or not str(valeur).strip():
        return None, f"{label} est obligatoire."
    valeur = str(valeur).strip()
    if len(valeur) < 2:
        return None, f"{label} doit contenir au moins 2 caractères."
    if len(valeur) > 50:
        return None, f"{label} ne doit pas dépasser 50 caractères."
    if not re.match(r"^[a-zA-ZÀ-ÿ\s\-']+$", valeur):
        return None, f"{label} ne doit contenir que des lettres."
    return valeur, None


class ParticipationEvenementViewSet(viewsets.ModelViewSet):
    queryset = ParticipationEvenement.objects.all()
    serializer_class = ParticipationEvenementSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        evenement_id = self.request.query_params.get('evenement')
        if evenement_id:
            queryset = queryset.filter(evenement_id=evenement_id)
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset.select_related('client', 'evenement').order_by('-date_inscription')

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()

            evenement_id = data.get('evenement')
            if not evenement_id:
                return Response(
                    {'evenement': ["L'événement est requis."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                evenement = Evenement.objects.get(id=evenement_id)
            except (Evenement.DoesNotExist, ValueError, TypeError):
                return Response(
                    {'evenement': ["Événement non trouvé."]},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if evenement.places_restantes <= 0:
                return Response(
                    {'error': "Cet événement est complet."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            erreurs = {}

            email, err = valider_email_format(data.get('email'))
            if err:
                erreurs['email'] = [err]

            nom, err = valider_nom_prenom(data.get('nom'), "Le nom")
            if err:
                erreurs['nom'] = [err]

            prenom, err = valider_nom_prenom(data.get('prenom'), "Le prénom")
            if err:
                erreurs['prenom'] = [err]

            telephone, err = valider_telephone(data.get('telephone'))
            if err:
                erreurs['telephone'] = [err]

            notes = str(data.get('notes') or data.get('message') or '').strip()
            if len(notes) > 500:
                erreurs['notes'] = ["Les notes ne doivent pas dépasser 500 caractères."]

            try:
                nombre_places = int(data.get('nombre_places', 1))
                if nombre_places < 1:
                    erreurs['nombre_places'] = ["Minimum 1 place."]
                elif nombre_places > evenement.places_restantes:
                    erreurs['nombre_places'] = [
                        f"Seulement {evenement.places_restantes} place(s) restante(s)."
                    ]
            except (ValueError, TypeError):
                erreurs['nombre_places'] = ["Nombre de places invalide."]

            if erreurs:
                return Response(erreurs, status=status.HTTP_400_BAD_REQUEST)

            client, _ = Client.objects.get_or_create(
                email=email,
                defaults={'nom': nom, 'prenom': prenom, 'telephone': telephone},
            )

            if ParticipationEvenement.objects.filter(evenement=evenement, client=client).exists():
                return Response(
                    {'error': "Vous êtes déjà inscrit à cet événement."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            participation = ParticipationEvenement.objects.create(
                evenement=evenement, client=client, statut='INSCRIT', notes=notes,
            )

            evenement.places_restantes = max(0, evenement.places_restantes - nombre_places)
            evenement.save(update_fields=['places_restantes'])

            serializer = self.get_serializer(participation)
            return Response(
                {
                    'success': True,
                    'message': 'Inscription réussie',
                    'data': serializer.data,
                    'places_restantes': evenement.places_restantes,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': "Une erreur interne est survenue. Veuillez réessayer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# =============================================
# ✅ VIEWSETS ADMIN
# =============================================

class ClientViewSet(AdminOnlyViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer


class RendezVousViewSet(AdminOnlyViewSet):
    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer


class PanierViewSet(AdminOnlyViewSet):
    queryset = Panier.objects.all()
    serializer_class = PanierSerializer


class CodeAccesFormationViewSet(AdminOnlyViewSet):
    queryset = CodeAccesFormation.objects.all()
    serializer_class = CodeAccesFormationSerializer


class AvisProduitViewSet(AdminOnlyViewSet):
    queryset = AvisProduit.objects.all()
    serializer_class = AvisProduitSerializer


class PromotionViewSet(AdminOnlyViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer


class WishlistViewSet(AdminOnlyViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer


class ContactMessageViewSet(AdminOnlyViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer


class NotificationViewSet(AdminOnlyViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class AdminLogViewSet(AdminOnlyViewSet):
    queryset = AdminLog.objects.all()
    serializer_class = AdminLogSerializer


class SiteSettingsViewSet(AdminOnlyViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer


# =============================================
# ✅ COMMANDES (sécurisé)
# =============================================

class CommandeViewSet(viewsets.ModelViewSet):
    """
    CREATE : public (invité ou client)
    LIST : filtrée par X-Client-Token si non-staff
    RETRIEVE / UPDATE / DELETE : admin
    """
    queryset = Commande.objects.all().order_by('-date_commande')
    serializer_class = CommandeSerializer

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        queryset = super().get_queryset().select_related('client').prefetch_related('lignes__produit')

        # Admin → tout (avec filtres optionnels)
        if self.request.user.is_authenticated and self.request.user.is_staff:
            client_id = self.request.query_params.get('client')
            if client_id:
                queryset = queryset.filter(client_id=client_id)

        # Client authentifié via X-Client-Token → seulement SES commandes
        else:
            client = get_client_from_request(self.request)
            if client is None:
                return Commande.objects.none()
            queryset = queryset.filter(client=client)

        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(id__icontains=search) |
                Q(client__nom__icontains=search) |
                Q(client__prenom__icontains=search) |
                Q(adresse_livraison__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()

            email = data.get('email')
            if not email:
                return Response({'error': "L'email est requis"}, status=status.HTTP_400_BAD_REQUEST)

            client, _ = Client.objects.get_or_create(
                email=email,
                defaults={
                    'nom': data.get('nom', 'Client'),
                    'prenom': data.get('prenom', 'Inconnu'),
                    'telephone': data.get('telephone', ''),
                },
            )

            produit_id = data.get('produit_id')
            if not produit_id:
                return Response({'error': "Le produit est requis"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                produit = Produit.objects.get(id=produit_id)
            except Produit.DoesNotExist:
                return Response({'error': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)

            try:
                quantite = int(data.get('quantite', 1))
            except (ValueError, TypeError):
                return Response({'error': 'Quantité invalide'}, status=status.HTTP_400_BAD_REQUEST)

            if quantite <= 0:
                return Response({'error': 'Quantité invalide'}, status=status.HTTP_400_BAD_REQUEST)

            prix_unitaire = (
                produit.prix_promotion
                if produit.est_en_promotion and produit.prix_promotion
                else produit.prix
            )
            total = float(prix_unitaire) * quantite

            commande = Commande.objects.create(
                client=client,
                statut='EN_ATTENTE',
                total=total,
                adresse_livraison=data.get('adresse', ''),
                ville=data.get('ville', ''),
                code_postal=data.get('codePostal', ''),
                telephone=client.telephone or '',
                notes=data.get('notes', ''),
            )

            LigneCommande.objects.create(
                commande=commande,
                produit=produit,
                quantite=quantite,
                prix_unitaire=prix_unitaire,
            )

            produit.quantite_stock = max(0, produit.quantite_stock - quantite)
            produit.save(update_fields=['quantite_stock'])

            try:
                envoyer_sms_confirmation(client, commande, produit, quantite, total)
            except Exception as e:
                print(f"❌ Erreur lors de l'envoi du SMS: {e}")

            serializer = self.get_serializer(commande)
            return Response(
                {
                    'success': True,
                    'message': 'Commande créée avec succès',
                    'data': serializer.data,
                    'id': commande.id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ DASHBOARD STATS
# =============================================

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            now = timezone.now()
            first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            stats = {
                'users': User.objects.count(),
                'clients': Client.objects.count(),
                'events': Evenement.objects.count(),
                'products': Produit.objects.count(),
                'formations': FormationEnLigne.objects.count(),
                'inscriptions': InscriptionFormation.objects.count(),
                'pending_payments': TransactionPaiement.objects.filter(statut='EN_ATTENTE').count(),
                'revenue': 0,
            }

            total_revenue = (
                TransactionPaiement.objects.filter(statut='REUSSI')
                .aggregate(total=Sum('montant'))['total'] or 0
            )
            stats['revenue'] = float(total_revenue)

            recent_activities = []

            for ins in (
                InscriptionFormation.objects.select_related('client', 'formation')
                .order_by('-date_inscription')[:5]
            ):
                recent_activities.append({
                    'id': ins.id,
                    'action': 'CREATE',
                    'model_name': 'Inscription formation',
                    'admin_username': f"{ins.client.prenom} {ins.client.nom}",
                    'created_at': ins.date_inscription.isoformat(),
                    'details': f"Inscription à {ins.formation.titre}",
                    'statut': ins.statut,
                    'montant': float(ins.montant),
                    'formation_id': ins.formation.id,
                })

            for trans in (
                TransactionPaiement.objects.select_related('inscription')
                .order_by('-date_creation')[:3]
            ):
                recent_activities.append({
                    'id': trans.id,
                    'action': 'CREATE' if trans.statut == 'REUSSI' else 'UPDATE',
                    'model_name': 'Paiement',
                    'admin_username': 'Système',
                    'created_at': trans.date_creation.isoformat(),
                    'details': f"Paiement de {trans.montant} CFA - {trans.get_statut_display()}",
                    'statut': trans.statut,
                    'montant': float(trans.montant),
                })

            recent_activities.sort(key=lambda x: x['created_at'], reverse=True)
            recent_activities = recent_activities[:10]

            monthly_stats = {
                'new_users': User.objects.filter(date_joined__gte=first_day_of_month).count(),
                'new_inscriptions': InscriptionFormation.objects.filter(
                    date_inscription__gte=first_day_of_month
                ).count(),
                'new_events': Evenement.objects.filter(
                    created_at__gte=first_day_of_month
                ).count(),
                'new_products': Produit.objects.filter(
                    created_at__gte=first_day_of_month
                ).count(),
                'revenue_month': float(
                    TransactionPaiement.objects.filter(
                        statut='REUSSI', date_validation__gte=first_day_of_month
                    ).aggregate(total=Sum('montant'))['total'] or 0
                ),
            }

            inscriptions_attente = (
                InscriptionFormation.objects.filter(statut='EN_ATTENTE')
                .select_related('client', 'formation')
                .order_by('-date_inscription')[:15]
            )
            inscriptions_data = []
            for ins in inscriptions_attente:
                paiement = TransactionPaiement.objects.filter(
                    inscription=ins, statut='REUSSI'
                ).first()
                inscriptions_data.append({
                    'id': ins.id,
                    'client': {
                        'id': ins.client.id,
                        'nom': ins.client.nom,
                        'prenom': ins.client.prenom,
                        'email': ins.client.email,
                        'telephone': ins.client.telephone,
                    },
                    'formation': {
                        'id': ins.formation.id,
                        'titre': ins.formation.titre,
                        'prix': float(ins.formation.prix),
                    },
                    'statut': ins.statut,
                    'montant': float(ins.montant),
                    'date_inscription': ins.date_inscription.isoformat(),
                    'paiement_effectue': paiement is not None,
                    'code_acces': ins.code_acces.code if ins.code_acces else None,
                })

            formation_stats = {
                'total_inscriptions': InscriptionFormation.objects.count(),
                'en_attente': InscriptionFormation.objects.filter(statut='EN_ATTENTE').count(),
                'payees': InscriptionFormation.objects.filter(statut='PAYEE').count(),
                'inscriptions_recents': inscriptions_data,
            }

            dernier_evenement = (
                Evenement.objects
                .filter(id__in=ParticipationEvenement.objects.values_list('evenement_id', flat=True).distinct())
                .order_by('-date_debut')
                .first()
            )
            evenement_clients = []
            evenement_titre = "Aucun événement avec participants"
            evenement_id = None
            total_inscrits = 0

            if dernier_evenement:
                evenement_titre = dernier_evenement.titre
                evenement_id = dernier_evenement.id
                participations = (
                    ParticipationEvenement.objects.filter(
                        evenement=dernier_evenement, statut='INSCRIT'
                    )
                    .select_related('client')
                    .order_by('-date_inscription')[:10]
                )
                total_inscrits = ParticipationEvenement.objects.filter(
                    evenement=dernier_evenement, statut='INSCRIT'
                ).count()
                for p in participations:
                    c = p.client
                    evenement_clients.append({
                        'id': c.id,
                        'nom': c.nom,
                        'prenom': c.prenom,
                        'email': c.email,
                        'telephone': c.telephone,
                        'statut_inscription': p.statut,
                        'date_inscription': p.date_inscription.isoformat(),
                    })

            evenement_stats = {
                'total_participations': ParticipationEvenement.objects.filter(statut='INSCRIT').count(),
                'evenement_recent': {
                    'id': evenement_id,
                    'titre': evenement_titre,
                    'clients': evenement_clients,
                    'total_inscrits': total_inscrits,
                },
            }

            commandes_stats = {
                'total': Commande.objects.count(),
                'en_attente': Commande.objects.filter(statut='EN_ATTENTE').count(),
                'en_preparation': Commande.objects.filter(statut='EN_PREPARATION').count(),
                'livrees': Commande.objects.filter(statut='LIVREE').count(),
                'recents': [],
            }
            for cmd in Commande.objects.select_related('client').order_by('-date_commande')[:10]:
                commandes_stats['recents'].append({
                    'id': cmd.id,
                    'client': {
                        'id': cmd.client.id,
                        'nom': cmd.client.nom,
                        'prenom': cmd.client.prenom,
                    } if cmd.client else None,
                    'total': float(cmd.total),
                    'statut': cmd.statut,
                    'date_commande': cmd.date_commande.isoformat(),
                })

            return Response({
                'success': True,
                'stats': stats,
                'recent_activities': recent_activities,
                'monthly_stats': monthly_stats,
                'formation_stats': formation_stats,
                'evenement_stats': evenement_stats,
                'commandes_stats': commandes_stats,
            })

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ INSCRIPTION RELOOKING
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class InscriptionRelookingView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = InscriptionRelookingSerializer(data=request.data)
        if serializer.is_valid():
            inscription = serializer.save()
            return Response(
                {'success': True, 'id': inscription.id},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminInscriptionRelookingViewSet(AdminOnlyViewSet):
    queryset = InscriptionRelooking.objects.all()
    serializer_class = InscriptionRelookingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        type_relooking = self.request.query_params.get('type')
        if type_relooking:
            queryset = queryset.filter(type=type_relooking)
        return queryset