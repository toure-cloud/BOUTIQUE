from urllib import request
import re
import traceback
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import ParticipationEvenement, Client, Evenement
from .serializers import ParticipationEvenementSerializer
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .utils import envoyer_sms_confirmation
import base64
import qrcode
from io import BytesIO
from datetime import datetime, timedelta
import random
import json
import string
from .models import (
    FormationEnLigne,InscriptionRelooking,
    LigneCommande,
    Evenement,
    Produit,
    Forfait,
    RubriqueRelookingFemme,
    RubriqueRelookingHomme,
    RubriqueAtelier,
    Coach,
    Actualite,
    FAQ,
    Client,
    RendezVous,
    ParticipationEvenement,
    Panier,
    Commande,
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
    LignePanier,  # ✅ Ajouté
)
from .serializers import (
    FormationEnLigneSerializer,
    EvenementSerializer,
    ProduitSerializer,
    ForfaitSerializer,
    RubriqueRelookingFemmeSerializer,
    RubriqueRelookingHommeSerializer,
    RubriqueAtelierSerializer,
    CoachSerializer,
    ActualiteSerializer,
    FAQSerializer,
    ClientSerializer,
    RendezVousSerializer,
    ParticipationEvenementSerializer,
    PanierSerializer,
    CommandeSerializer,
    CodeAccesFormationSerializer,
    InscriptionFormationSerializer,
    MoyenPaiementSerializer,
    TransactionPaiementSerializer,
    AvisProduitSerializer,
    PromotionSerializer,
    WishlistSerializer,
    ContactMessageSerializer,
    NotificationSerializer,
    AdminLogSerializer,
    SiteSettingsSerializer,
    # ✅ Nouveaux serializers pour l'authentification client
    ClientRegisterSerializer,
    ClientLoginSerializer,InscriptionRelooking,InscriptionRelookingSerializer,
    LignePanierSerializer,
)


# =============================================
# ✅ VUES JWT POUR L'AUTHENTIFICATION
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainView(APIView):
    """
    Vue pour obtenir un token JWT
    CSRF exempté UNIQUEMENT pour cette vue
    """
    permission_classes = [AllowAny]

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
                    {'error': 'Nom d\'utilisateur et mot de passe requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(username=username, password=password)

            if user is not None:
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
                    }
                })
            else:
                return Response(
                    {'error': 'Identifiants incorrects'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except json.JSONDecodeError:
            return Response(
                {'error': 'Format JSON invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenRefreshView(APIView):
    """
    Vue pour rafraîchir le token JWT
    CSRF exempté UNIQUEMENT pour cette vue
    """
    permission_classes = [AllowAny]

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
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                refresh = RefreshToken(refresh_token)
                return Response({
                    'access': str(refresh.access_token),
                })
            except Exception:
                return Response(
                    {'error': 'Token invalide ou expiré'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class CurrentUserView(APIView):
    """
    Vue pour récupérer l'utilisateur connecté
    CSRF exempté UNIQUEMENT pour cette vue
    """

    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Token requis'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            from rest_framework_simplejwt.exceptions import InvalidToken

            auth = JWTAuthentication()
            token = auth_header.split(' ')[1]
            validated_token = auth.get_validated_token(token)
            user = auth.get_user(validated_token)

            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
        except (InvalidToken, IndexError):
            return Response(
                {'error': 'Token invalide ou expiré'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


# =============================================
# ✅ VUES PUBLIQUES POUR OTP & INSCRIPTION
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        # Votre logique pour générer et envoyer le code OTP
        return Response({'success': True, 'message': 'Code envoyé', 'email': email})


@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('otp')
        # Votre logique de vérification du code
        return Response({'success': True, 'message': 'Code vérifié'})


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Votre logique d'inscription (création de l'utilisateur Django)
        return Response({'success': True, 'message': 'Utilisateur créé'})


# =============================================
# ✅ VUES CLIENT (Authentification & Panier)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class ClientRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientRegisterSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.save()
            return Response({'success': True, 'client_id': client.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ClientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                client = Client.objects.get(email=email)
                if client.check_password(password):  # ✅ Utiliser check_password()
                    return Response({
                        'success': True,
                        'client': ClientSerializer(client).data
                    })
                return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            except Client.DoesNotExist:
                return Response({'error': 'Client non trouvé'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class PanierView(APIView):
    def get(self, request, client_id):
        # ✅ Vérifier que le client existe
        if not Client.objects.filter(id=client_id).exists():
            return Response(
                {'error': 'Client non trouvé. Veuillez vous reconnecter.'},
                status=status.HTTP_404_NOT_FOUND
            )
        panier, created = Panier.objects.get_or_create(client_id=client_id, est_valide=False)
        serializer = PanierSerializer(panier, context={'request': request})
        return Response(serializer.data)

    def post(self, request, client_id):
        # ✅ Vérifier que le client existe AVANT de créer le panier
        if not Client.objects.filter(id=client_id).exists():
            return Response(
                {'error': 'Client non trouvé. Veuillez vous reconnecter.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        panier, created = Panier.objects.get_or_create(client_id=client_id, est_valide=False)
        produit_id = request.data.get('produit_id')
        quantite = int(request.data.get('quantite', 1))
        
        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            return Response({'error': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        ligne, created = LignePanier.objects.get_or_create(
            panier=panier, produit=produit,
            defaults={'quantite': quantite, 'prix_unitaire': produit.prix}
        )
        if not created:
            ligne.quantite += quantite
            ligne.save()
        
        return Response(PanierSerializer(panier, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def delete(self, request, client_id):
        if not Client.objects.filter(id=client_id).exists():
            return Response(
                {'error': 'Client non trouvé. Veuillez vous reconnecter.'},
                status=status.HTTP_404_NOT_FOUND
            )
        ligne_id = request.data.get('ligne_id')
        panier, _ = Panier.objects.get_or_create(client_id=client_id, est_valide=False)
        LignePanier.objects.filter(id=ligne_id, panier=panier).delete()
        return Response(PanierSerializer(panier, context={'request': request}).data)

@method_decorator(csrf_exempt, name='dispatch')
class CommandeDepuisPanierView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, client_id):
        try:
            # 1. Récupérer le panier du client
            panier = Panier.objects.filter(client_id=client_id, est_valide=False).first()
            if not panier or not panier.lignes.exists():
                return Response({'error': 'Panier vide'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Calculer le total
            total = sum(ligne.sous_total for ligne in panier.lignes.all())

            
            commande = Commande.objects.create(
                client_id=client_id,
                statut='EN_ATTENTE',
                total=total,
                adresse_livraison=request.data.get('adresse', ''),
                ville=request.data.get('ville', ''),
                code_postal=request.data.get('codePostal', ''),
                telephone=request.data.get('telephone', ''),
                notes=request.data.get('notes', '')
            )

            
            for ligne in panier.lignes.all():
                LigneCommande.objects.create(
                    commande=commande,
                    produit=ligne.produit,
                    quantite=ligne.quantite,
                    prix_unitaire=ligne.prix_unitaire
                )
                # Mettre à jour le stock
                produit = ligne.produit
                produit.quantite_stock -= ligne.quantite
                if produit.quantite_stock < 0:
                    produit.quantite_stock = 0
                produit.save()

          
            panier.est_valide = True
            panier.save()

            
            client = Client.objects.get(id=client_id)
            try:
                envoyer_sms_confirmation(client, commande, ligne.produit, ligne.quantite, total)
            except Exception as e:
                print(f"❌ Erreur SMS: {str(e)}")
                

            return Response({'success': True, 'commande_id': commande.id, 'total': total}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# =============================================
# ✅ BASE VIEWSET POUR LE PUBLIC
# =============================================

class PublicViewSet(viewsets.ModelViewSet):
    """
    ViewSet de base :
    - Lecture (GET) : Public (AllowAny)
    - Écriture (POST, PUT, DELETE) : Admin uniquement (IsAdminUser)
    """

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


# =============================================
# ✅ ADMIN ONLY VIEWSET
# =============================================

class AdminOnlyViewSet(viewsets.ModelViewSet):
    """
    ViewSet réservé aux admins (lecture + écriture)
    """

    def get_permissions(self):
        return [IsAdminUser()]


# =============================================
# ✅ VIEWSETS PUBLICS (Lecture publique, Écriture admin)
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
                Q(titre__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset.order_by('ordre', '-created_at')


class EvenementViewSet(PublicViewSet):
    queryset = Evenement.objects.filter(statut__in=['A_VENIR', 'EN_COURS'])
    serializer_class = EvenementSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
        """
        ✅ Création d'un événement
        """
        try:
            data = request.data.copy()

            if 'places_total' in data:
                try:
                    data['places_restantes'] = int(data['places_total'])
                except (ValueError, TypeError):
                    return Response(
                        {'places_total': 'Le nombre de places doit être un nombre valide'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            if 'est_gratuit' in data:
                if data['est_gratuit'] in ['true', 'True', True, '1', 1]:
                    data['est_gratuit'] = True
                    data['prix'] = 0
                else:
                    data['est_gratuit'] = False

            if 'prix' in data:
                if data['prix'] == '' or data['prix'] is None:
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
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProduitViewSet(PublicViewSet):
    queryset = Produit.objects.filter(est_disponible=True)
    serializer_class = ProduitSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        categorie = self.request.query_params.get('categorie')
        if categorie:
            queryset = queryset.filter(categorie=categorie)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset


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
# ✅ PAIEMENTS (PUBLIC POUR CREATION, ADMIN POUR VISUALISATION)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class PaiementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les paiements
    - CREATE, GENERER_QR, CARTE : Public (AllowAny)
    - LIST, RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
    queryset = TransactionPaiement.objects.all().order_by('-date_creation')
    serializer_class = TransactionPaiementSerializer

    def get_permissions(self):
        if self.action in ['create', 'generer_qr', 'carte']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def generer_qr(self, request):
        """
        Générer un QR code pour un paiement (accès public)
        """
        try:
            montant = request.data.get('montant')
            moyen_paiement_id = request.data.get('moyen_paiement')
            inscription_id = request.data.get('inscription')

            if not montant or not moyen_paiement_id:
                return Response(
                    {'error': 'Montant et moyen de paiement requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                moyen_paiement = MoyenPaiement.objects.get(id=moyen_paiement_id)
            except MoyenPaiement.DoesNotExist:
                return Response(
                    {'error': 'Moyen de paiement invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            reference = f"QR-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

            qr_data = {
                'reference': reference,
                'montant': float(montant),
                'moyen_paiement': moyen_paiement_id,
                'moyen_paiement_nom': moyen_paiement.nom,
                'inscription': inscription_id,
                'date': datetime.now().isoformat(),
                'expiration': (datetime.now() + timedelta(seconds=60)).isoformat(),
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
                    'expiration': (timezone.now() + timedelta(seconds=60)).isoformat(),
                }
            )

            return Response({
                'success': True,
                'qr_code': qr_base64,
                'reference': reference,
                'expiration': (timezone.now() + timedelta(seconds=60)).isoformat(),
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
                reference=f"CRD-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}",
                date_validation=timezone.now(),
                details={
                    'type': 'CARTE_BANCAIRE',
                    'titulaire': data.get('titulaire', ''),
                    'dernier_chiffres': numero_carte[-4:],
                }
            )

            inscription.statut = 'PAYEE'
            inscription.reference_paiement = transaction.reference
            inscription.save()

            return Response({
                'success': True,
                'message': 'Paiement effectué avec succès',
                'reference': transaction.reference,
                'data': TransactionPaiementSerializer(transaction).data,
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ INSCRIPTION FORMATION (PUBLIC + ADMIN)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class InscriptionFormationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les inscriptions aux formations
    - CREATE : Public (AllowAny) - pour s'inscrire
    - LIST, RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
    queryset = InscriptionFormation.objects.all()
    serializer_class = InscriptionFormationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('client', 'formation', 'code_acces')

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
        """
        ✅ Inscription à une formation (accessible au public)
        """
        try:
            data = request.data.copy()
            print(f"📦 Données reçues: {data}")

            formation_id = data.get('formation')
            if not formation_id:
                return Response({'error': 'La formation est requise'}, status=status.HTTP_400_BAD_REQUEST)

            formation = get_object_or_404(FormationEnLigne, id=formation_id)

            email = data.get('email')
            if not email:
                return Response({'error': 'L\'email est requis'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                client = Client.objects.get(email=email)
            except Client.DoesNotExist:
                client = Client.objects.create(
                    email=email,
                    nom=data.get('nom', 'Client'),
                    prenom=data.get('prenom', 'Inconnu'),
                    telephone=data.get('telephone', '')
                )

            existing = InscriptionFormation.objects.filter(
                formation=formation,
                client=client
            ).first()

            if existing:
                return Response({'error': 'Vous êtes déjà inscrit à cette formation'}, status=status.HTTP_400_BAD_REQUEST)

            inscription = InscriptionFormation.objects.create(
                formation=formation,
                client=client,
                statut='EN_ATTENTE',
                montant=formation.prix,
                notes=data.get('notes', '')
            )

            serializer = self.get_serializer(inscription)

            return Response({
                'success': True,
                'message': 'Inscription réussie',
                'data': serializer.data,
                'id': inscription.id,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"❌ Erreur inscription: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """
        ✅ Mise à jour d'une inscription (admin)
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()

            data = {}
            allowed_fields = ['statut', 'notes']

            for field in allowed_fields:
                if field in request.data:
                    data[field] = request.data[field]

            if 'statut' in data:
                valid_statuts = ['EN_ATTENTE', 'PAYEE', 'ANNULEE', 'REMBOURSEE']
                if data['statut'] not in valid_statuts:
                    return Response(
                        {'error': f'Statut invalide. Choisir parmi: {", ".join(valid_statuts)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            serializer = self.get_serializer(instance, data=data, partial=partial)

            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"❌ Erreur mise à jour: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def generer_code(self, request, pk=None):
        """
        Générer un code d'accès pour une inscription (admin uniquement)
        """
        try:
            inscription = self.get_object()

            if inscription.statut != 'PAYEE':
                return Response({'error': 'L\'inscription doit être payée pour générer un code d\'accès'}, status=status.HTTP_400_BAD_REQUEST)

            if inscription.code_acces:
                return Response({
                    'success': True,
                    'message': 'Un code d\'accès existe déjà',
                    'code': inscription.code_acces.code,
                    'data': CodeAccesFormationSerializer(inscription.code_acces).data
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
            inscription.save()

            return Response({
                'success': True,
                'message': 'Code d\'accès généré avec succès',
                'code': code,
                'data': CodeAccesFormationSerializer(code_acces).data
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def verifier_code(self, request, pk=None):
        """
        Vérifier un code d'accès (public)
        """
        try:
            code = request.data.get('code')
            email = request.data.get('email')

            if not code or not email:
                return Response({'error': 'Le code et l\'email sont requis'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                code_acces = CodeAccesFormation.objects.get(
                    code=code,
                    client__email=email,
                    statut='ACTIF'
                )
            except CodeAccesFormation.DoesNotExist:
                return Response({'error': 'Code d\'accès invalide ou expiré'}, status=status.HTTP_404_NOT_FOUND)

            if code_acces.date_expiration < timezone.now():
                code_acces.statut = 'EXPIRE'
                code_acces.save()
                return Response({'error': 'Code d\'accès expiré'}, status=status.HTTP_400_BAD_REQUEST)

            inscription = InscriptionFormation.objects.filter(
                code_acces=code_acces,
                statut='PAYEE'
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
        """
        Valider le paiement d'une inscription
        """
        try:
            inscription = self.get_object()

            if inscription.statut == 'PAYEE':
                return Response({'success': False, 'message': 'Le paiement est déjà validé'}, status=status.HTTP_400_BAD_REQUEST)

            inscription.statut = 'PAYEE'
            inscription.save()

            TransactionPaiement.objects.create(
                inscription=inscription,
                montant=inscription.montant,
                statut='REUSSI',
                reference=f"PAY-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                date_validation=timezone.now(),
                details={
                    'type': 'validation_manuelle',
                    'valide_par': request.user.username if request.user.is_authenticated else 'admin'
                }
            )

            return Response({'success': True, 'message': 'Paiement validé avec succès', 'data': self.get_serializer(inscription).data})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        """
        Refuser une inscription
        """
        try:
            inscription = self.get_object()

            if inscription.statut == 'ANNULEE':
                return Response({'success': False, 'message': 'L\'inscription est déjà annulée'}, status=status.HTTP_400_BAD_REQUEST)

            inscription.statut = 'ANNULEE'
            inscription.save()

            return Response({'success': True, 'message': 'Inscription refusée avec succès', 'data': self.get_serializer(inscription).data})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ TRANSACTION PAIEMENT (PUBLIC + ADMIN)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class TransactionPaiementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les transactions de paiement
    - CREATE : Public (AllowAny) - pour payer
    - LIST, RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
    queryset = TransactionPaiement.objects.all()
    serializer_class = TransactionPaiementSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        """
        ✅ Création d'une transaction de paiement
        """
        try:
            data = request.data.copy()

            inscription_id = data.get('inscription')
            if not inscription_id:
                return Response({'error': 'L\'inscription est requise'}, status=status.HTTP_400_BAD_REQUEST)

            inscription = get_object_or_404(InscriptionFormation, id=inscription_id)

            transaction = TransactionPaiement.objects.create(
                inscription=inscription,
                moyen_paiement_id=data.get('moyen_paiement'),
                montant=inscription.montant,
                statut='EN_ATTENTE',
                reference=f"TXN-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                details=data.get('details', {})
            )

            inscription.statut = 'PAYEE'
            inscription.reference_paiement = transaction.reference
            inscription.save()

            if inscription.formation:
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                CodeAccesFormation.objects.create(
                    formation=inscription.formation,
                    client=inscription.client,
                    code=code,
                    date_expiration=timezone.now() + timedelta(days=30),
                    montant_paye=inscription.montant,
                    reference_paiement=transaction.reference
                )

            serializer = self.get_serializer(transaction)

            return Response({
                'success': True,
                'message': 'Paiement effectué avec succès',
                'data': serializer.data,
                'reference': transaction.reference,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# ✅ PARTICIPATION ÉVÉNEMENT (PUBLIC + ADMIN)
# =============================================


# ─── Validateurs réutilisables ──────────────────────────────────
def valider_telephone(telephone):
    """Retourne (valeur_normalisée, erreur)."""
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
    """Retourne (valeur_normalisée, erreur)."""
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
    """Retourne (valeur_normalisée, erreur)."""
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
    """
    ViewSet pour les participations aux événements.
    - CREATE : Public (AllowAny)
    - LIST, RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
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
        """
        ✅ Inscription à un événement (accessible au public).
        Toutes les données sont validées AVANT toute écriture en base.
        """
        try:
            data = request.data.copy()
            print(f"📦 Données reçues pour participation: {data}")

            # ─── 1. Validation de l'événement ──────────────────
            evenement_id = data.get('evenement')
            if not evenement_id:
                return Response(
                    {'evenement': ["L'événement est requis."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                evenement = Evenement.objects.get(id=evenement_id)
            except (Evenement.DoesNotExist, ValueError, TypeError):
                return Response(
                    {'evenement': ["Événement non trouvé."]},
                    status=status.HTTP_404_NOT_FOUND
                )

            if evenement.places_restantes <= 0:
                return Response(
                    {'error': "Cet événement est complet."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ─── 2. Validation des champs ──────────────────────
            erreurs = {}

            # Email
            email, err = valider_email_format(data.get('email'))
            if err:
                erreurs['email'] = [err]

            # Nom
            nom, err = valider_nom_prenom(data.get('nom'), "Le nom")
            if err:
                erreurs['nom'] = [err]

            # Prénom
            prenom, err = valider_nom_prenom(data.get('prenom'), "Le prénom")
            if err:
                erreurs['prenom'] = [err]

            # Téléphone
            telephone, err = valider_telephone(data.get('telephone'))
            if err:
                erreurs['telephone'] = [err]

            # Notes (optionnel, 500 max)
            notes = data.get('notes') or data.get('message') or ''
            notes = str(notes).strip()
            if len(notes) > 500:
                erreurs['notes'] = ["Les notes ne doivent pas dépasser 500 caractères."]

            # Nombre de places (optionnel, défaut 1)
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

            # ─── 3. Si erreurs → renvoyer 400 ──────────────────
            if erreurs:
                print(f"❌ Erreurs de validation: {erreurs}")
                return Response(erreurs, status=status.HTTP_400_BAD_REQUEST)

            # ─── 4. Récupérer ou créer le client ───────────────
            try:
                client = Client.objects.get(email=email)
                print(f"✅ Client existant: {client.id}")

                # Mise à jour optionnelle des infos client si elles ont changé
                updated = False
                if client.nom != nom:
                    client.nom = nom
                    updated = True
                if client.prenom != prenom:
                    client.prenom = prenom
                    updated = True
                if client.telephone != telephone:
                    client.telephone = telephone
                    updated = True
                if updated:
                    client.save()
                    print(f"✅ Client mis à jour: {client.id}")

            except Client.DoesNotExist:
                client = Client.objects.create(
                    nom=nom,
                    prenom=prenom,
                    email=email,
                    telephone=telephone,
                )
                print(f"✅ Nouveau client créé: {client.id}")

            # ─── 5. Vérifier si déjà inscrit ───────────────────
            existing = ParticipationEvenement.objects.filter(
                evenement=evenement,
                client=client,
            ).first()

            if existing:
                return Response(
                    {'error': "Vous êtes déjà inscrit à cet événement."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ─── 6. Créer la participation ─────────────────────
            participation = ParticipationEvenement.objects.create(
                evenement=evenement,
                client=client,
                statut='INSCRIT',
                notes=notes,
            )

            # ─── 7. Décrémenter les places restantes ───────────
            evenement.places_restantes -= nombre_places
            if evenement.places_restantes < 0:
                evenement.places_restantes = 0
            evenement.save()

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
            print(f"❌ Erreur inscription: {str(e)}")
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
# ✅ COMMANDE VIEWSET
# =============================================
class CommandeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les commandes
    - CREATE (POST) : Public (AllowAny) - Pour passer commande
    - LIST (GET) : Public avec filtre client obligatoire (pour que le client voie SES commandes)
    - RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
    queryset = Commande.objects.all().order_by('-date_commande')
    serializer_class = CommandeSerializer

    def get_permissions(self):
        # ✅ Le public peut créer une commande
        if self.action == 'create':
            return [AllowAny()]
        # ✅ Le public peut LIRE ses propres commandes (filtrées par client_id)
        if self.action == 'list':
            return [AllowAny()]
        # ❌ Admin uniquement pour tout le reste (retrieve, update, delete)
        return [IsAdminUser()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('client').prefetch_related('lignes__produit')

        # ✅ Récupérer le client_id depuis les query params
        client_id = self.request.query_params.get('client')
        
        # ✅ SÉCURITÉ CRITIQUE :
        # - Si l'utilisateur est admin → il voit tout (avec filtre optionnel)
        # - Si l'utilisateur N'EST PAS admin :
        #     - S'il n'y a PAS de client_id → on renvoie une liste VIDE (aucune fuite)
        #     - S'il y a un client_id → on filtre par ce client_id
        if not self.request.user.is_staff:
            if not client_id:
                return Commande.objects.none()
            queryset = queryset.filter(client_id=client_id)
        else:
            # Admin : filtrage optionnel
            if client_id:
                queryset = queryset.filter(client_id=client_id)

        # Filtrage par statut (optionnel)
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        # Recherche (optionnelle)
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
        """
        ✅ Création d'une commande (accessible au public)
        """
        try:
            data = request.data.copy()
            print(f"📦 Données commande reçues: {data}")

            # 1. Récupérer ou créer le client
            email = data.get('email')
            if not email:
                return Response({'error': "L'email est requis"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                client = Client.objects.get(email=email)
            except Client.DoesNotExist:
                client = Client.objects.create(
                    nom=data.get('nom', 'Client'),
                    prenom=data.get('prenom', 'Inconnu'),
                    email=email,
                    telephone=data.get('telephone', '')
                )

            # 2. Récupérer le produit
            produit_id = data.get('produit_id')
            if not produit_id:
                return Response({'error': "Le produit est requis"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                produit = Produit.objects.get(id=produit_id)
            except Produit.DoesNotExist:
                return Response({'error': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)

            quantite = int(data.get('quantite', 1))
            if quantite <= 0:
                return Response({'error': 'Quantité invalide'}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Calculer le total
            prix_unitaire = produit.prix_promotion if produit.est_en_promotion and produit.prix_promotion else produit.prix
            total = float(prix_unitaire) * quantite

            # 4. Créer la commande
            commande = Commande.objects.create(
                client=client,
                statut='EN_ATTENTE',
                total=total,
                adresse_livraison=data.get('adresse', ''),
                ville=data.get('ville', ''),
                code_postal=data.get('codePostal', ''),
                telephone=client.telephone,
                notes=data.get('notes', '')
            )

            # 5. Créer la ligne de commande
            LigneCommande.objects.create(
                commande=commande,
                produit=produit,
                quantite=quantite,
                prix_unitaire=prix_unitaire
            )

            # 6. Mettre à jour le stock
            produit.quantite_stock -= quantite
            if produit.quantite_stock < 0:
                produit.quantite_stock = 0
            produit.save()

            # 7. Envoyer le SMS de confirmation
            try:
                envoyer_sms_confirmation(client, commande, produit, quantite, total)
            except Exception as e:
                print(f"❌ Erreur lors de l'envoi du SMS: {str(e)}")

            serializer = self.get_serializer(commande)
            return Response({
                'success': True,
                'message': 'Commande créée avec succès',
                'data': serializer.data,
                'id': commande.id,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =============================================
# ✅ DASHBOARD STATS
# =============================================

class DashboardStatsView(APIView):
    """
    Vue pour récupérer les statistiques du dashboard
    Réservé aux admins
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            now = timezone.now()
            first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # ===== STATISTIQUES DE BASE =====
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

            # Revenu total
            successful_transactions = TransactionPaiement.objects.filter(statut='REUSSI')
            total_revenue = successful_transactions.aggregate(total=Sum('montant'))['total'] or 0
            stats['revenue'] = float(total_revenue)

            # ===== ACTIVITÉS RÉCENTES =====
            recent_activities = []

            recent_inscriptions = InscriptionFormation.objects.select_related(
                'client', 'formation'
            ).order_by('-date_inscription')[:5]

            for ins in recent_inscriptions:
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

            recent_transactions = TransactionPaiement.objects.select_related(
                'inscription'
            ).order_by('-date_creation')[:3]

            for trans in recent_transactions:
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

            # ===== STATISTIQUES DU MOIS =====
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
                        statut='REUSSI',
                        date_validation__gte=first_day_of_month
                    ).aggregate(total=Sum('montant'))['total'] or 0
                ),
            }

            # ===== LISTE DES INSCRIPTIONS FORMATIONS EN ATTENTE =====
            inscriptions_attente = InscriptionFormation.objects.filter(
                statut='EN_ATTENTE'
            ).select_related('client', 'formation').order_by('-date_inscription')[:15]

            inscriptions_data = []
            for ins in inscriptions_attente:
                paiement = TransactionPaiement.objects.filter(
                    inscription=ins,
                    statut='REUSSI'
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

            # ===== STATISTIQUES DES FORMATIONS =====
            formation_stats = {
                'total_inscriptions': InscriptionFormation.objects.count(),
                'en_attente': InscriptionFormation.objects.filter(statut='EN_ATTENTE').count(),
                'payees': InscriptionFormation.objects.filter(statut='PAYEE').count(),
                'inscriptions_recents': inscriptions_data,
            }

            # ===== ✅ LISTE DES PARTICIPANTS À L'ÉVÉNEMENT LE PLUS RÉCENT =====
            dernier_evenement = Evenement.objects.filter(
                id__in=ParticipationEvenement.objects.values_list('evenement_id', flat=True).distinct()
            ).order_by('-date_debut').first()

            evenement_clients = []
            evenement_titre = "Aucun événement avec participants"
            evenement_id = None
            total_inscrits = 0

            if dernier_evenement:
                evenement_titre = dernier_evenement.titre
                evenement_id = dernier_evenement.id

                participations = ParticipationEvenement.objects.filter(
                    evenement=dernier_evenement,
                    statut='INSCRIT'
                ).select_related('client').order_by('-date_inscription')[:10]

                total_inscrits = ParticipationEvenement.objects.filter(
                    evenement=dernier_evenement,
                    statut='INSCRIT'
                ).count()

                for participation in participations:
                    client = participation.client
                    evenement_clients.append({
                        'id': client.id,
                        'nom': client.nom,
                        'prenom': client.prenom,
                        'email': client.email,
                        'telephone': client.telephone,
                        'statut_inscription': participation.statut,
                        'date_inscription': participation.date_inscription.isoformat(),
                    })

            evenement_stats = {
                'total_participations': ParticipationEvenement.objects.filter(statut='INSCRIT').count(),
                'evenement_recent': {
                    'id': evenement_id,
                    'titre': evenement_titre,
                    'clients': evenement_clients,
                    'total_inscrits': total_inscrits,
                }
            }

            # ===== ✅ STATISTIQUES DES COMMANDES =====
            commandes_stats = {
                'total': Commande.objects.count(),
                'en_attente': Commande.objects.filter(statut='EN_ATTENTE').count(),
                'en_preparation': Commande.objects.filter(statut='EN_PREPARATION').count(),
                'livrees': Commande.objects.filter(statut='LIVREE').count(),
                'recents': [],
            }

            recent_commandes = Commande.objects.select_related('client').order_by('-date_commande')[:10]

            for cmd in recent_commandes:
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
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            # api/views.py (Ajoutez ces vues)

@method_decorator(csrf_exempt, name='dispatch')
class InscriptionRelookingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = InscriptionRelookingSerializer(data=request.data)
        if serializer.is_valid():
            inscription = serializer.save()
            return Response({'success': True, 'id': inscription.id}, status=status.HTTP_201_CREATED)
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