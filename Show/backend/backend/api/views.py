# api/views.py
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
import json
import random
import string
from datetime import timedelta

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
    - CREATE : Public (AllowAny) - pour effectuer un paiement
    - LIST, RETRIEVE, UPDATE, DELETE : Admin uniquement (IsAdminUser)
    """
    queryset = TransactionPaiement.objects.all().order_by('-date_creation')
    serializer_class = TransactionPaiementSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        date_debut = self.request.query_params.get('date_debut')
        if date_debut:
            queryset = queryset.filter(date_creation__gte=date_debut)
        
        date_fin = self.request.query_params.get('date_fin')
        if date_fin:
            queryset = queryset.filter(date_creation__lte=date_fin)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(reference__icontains=search) |
                Q(details__email__icontains=search) |
                Q(numero_transaction__icontains=search)
            )
        
        return queryset

    def create(self, request, *args, **kwargs):
        """
        ✅ Création d'un paiement par un client (public)
        """
        try:
            data = request.data.copy()
            
            email = data.get('email')
            montant = data.get('montant')
            moyen_paiement = data.get('moyen_paiement')
            
            if not email or not montant:
                return Response(
                    {'error': 'L\'email et le montant sont requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                client = Client.objects.get(email=email)
            except Client.DoesNotExist:
                client = Client.objects.create(
                    nom=data.get('nom', 'Client'),
                    prenom=data.get('prenom', 'Inconnu'),
                    email=email,
                    telephone=data.get('telephone', '')
                )
            
            transaction = TransactionPaiement.objects.create(
                montant=float(montant),
                moyen_paiement_id=moyen_paiement if moyen_paiement else None,
                statut='EN_ATTENTE',
                reference=f"PAY-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                details={
                    'email': email,
                    'nom': data.get('nom', ''),
                    'prenom': data.get('prenom', ''),
                    'telephone': data.get('telephone', ''),
                    'inscription': data.get('inscription'),
                }
            )
            
            serializer = self.get_serializer(transaction)
            
            return Response({
                'success': True,
                'message': 'Paiement enregistré avec succès',
                'data': serializer.data,
                'reference': transaction.reference,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        try:
            paiement = self.get_object()
            if paiement.statut == 'EN_ATTENTE':
                paiement.statut = 'REUSSI'
                paiement.date_validation = timezone.now()
                paiement.save()
                return Response({
                    'success': True,
                    'message': 'Paiement validé avec succès',
                    'data': self.get_serializer(paiement).data
                })
            else:
                return Response({
                    'success': False,
                    'message': f'Le paiement est déjà {paiement.get_statut_display()}'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        try:
            paiement = self.get_object()
            if paiement.statut in ['EN_ATTENTE', 'EN_COURS']:
                paiement.statut = 'ANNULE'
                paiement.save()
                return Response({
                    'success': True,
                    'message': 'Paiement annulé avec succès',
                    'data': self.get_serializer(paiement).data
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Le paiement ne peut pas être annulé'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def rembourser(self, request, pk=None):
        try:
            paiement = self.get_object()
            if paiement.statut == 'REUSSI':
                paiement.statut = 'REMBOURSE'
                paiement.save()
                return Response({
                    'success': True,
                    'message': 'Paiement remboursé avec succès',
                    'data': self.get_serializer(paiement).data
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Seul un paiement réussi peut être remboursé'
                }, status=status.HTTP_400_BAD_REQUEST)
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

    def create(self, request, *args, **kwargs):
        """
        ✅ Inscription à une formation (accessible au public)
        """
        try:
            data = request.data.copy()
            print(f"📦 Données reçues: {data}")
            
            formation_id = data.get('formation')
            if not formation_id:
                return Response(
                    {'error': 'La formation est requise'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            formation = get_object_or_404(FormationEnLigne, id=formation_id)
            
            email = data.get('email')
            if not email:
                return Response(
                    {'error': 'L\'email est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
                return Response(
                    {'error': 'Vous êtes déjà inscrit à cette formation'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ✅ CORRECTION: update et partial_update
    def update(self, request, *args, **kwargs):
        """
        ✅ Mise à jour complète d'une inscription (admin)
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # ✅ Récupérer uniquement les champs modifiables
            data = {}
            allowed_fields = ['statut', 'notes']  # ✅ Seuls ces champs sont modifiables
            
            for field in allowed_fields:
                if field in request.data:
                    data[field] = request.data[field]
            
            # ✅ Gérer le cas du statut
            if 'statut' in data:
                # ✅ Vérifier que le statut est valide
                valid_statuts = ['EN_ATTENTE', 'PAYEE', 'ANNULEE', 'REMBOURSEE']
                if data['statut'] not in valid_statuts:
                    return Response(
                        {'error': f'Statut invalide. Choisir parmi: {", ".join(valid_statuts)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = self.get_serializer(instance, data=data, partial=partial)
            
            if serializer.is_valid():
                self.perform_update(serializer)
                
                # ✅ Si le statut devient PAYEE, vérifier le paiement
                if data.get('statut') == 'PAYEE':
                    # Vérifier si un paiement existe
                    paiement = TransactionPaiement.objects.filter(
                        inscription=instance
                    ).first()
                    if not paiement:
                        # Créer un paiement simulé si nécessaire
                        TransactionPaiement.objects.create(
                            inscription=instance,
                            montant=instance.montant,
                            statut='REUSSI',
                            reference=f"PAY-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                            date_validation=timezone.now(),
                            details={'type': 'validation_manuelle'}
                        )
                
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"❌ Erreur mise à jour: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """
        ✅ Mise à jour partielle d'une inscription (admin)
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def generer_code(self, request, pk=None):
        """
        Générer un code d'accès pour une inscription
        """
        try:
            import random
            import string
            from datetime import timedelta
            
            inscription = self.get_object()
            
            # Vérifier que l'inscription est payée
            if inscription.statut != 'PAYEE':
                return Response(
                    {'error': 'L\'inscription doit être payée pour générer un code d\'accès'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier si un code existe déjà
            if inscription.code_acces:
                return Response({
                    'success': True,
                    'message': 'Un code d\'accès existe déjà',
                    'code': inscription.code_acces.code,
                })
            
            # Générer un nouveau code
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            
            # Créer le code d'accès
            code_acces = CodeAccesFormation.objects.create(
                formation=inscription.formation,
                client=inscription.client,
                code=code,
                date_expiration=timezone.now() + timedelta(days=30),
                montant_paye=inscription.montant,
                reference_paiement=inscription.reference_paiement,
            )
            
            inscription.code_acces = code_acces
            inscription.save()
            
            return Response({
                'success': True,
                'message': 'Code d\'accès généré avec succès',
                'code': code,
                'data': CodeAccesFormationSerializer(code_acces).data,
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def valider_paiement(self, request, pk=None):
        """
        Valider le paiement d'une inscription
        """
        try:
            inscription = self.get_object()
            
            if inscription.statut == 'PAYEE':
                return Response({
                    'success': False,
                    'message': 'Le paiement est déjà validé'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ✅ Mettre à jour le statut
            inscription.statut = 'PAYEE'
            inscription.save()
            
            # ✅ Créer une transaction de paiement
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
            
            return Response({
                'success': True,
                'message': 'Paiement validé avec succès',
                'data': self.get_serializer(inscription).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        """
        Refuser une inscription
        """
        try:
            inscription = self.get_object()
            
            if inscription.statut == 'ANNULEE':
                return Response({
                    'success': False,
                    'message': 'L\'inscription est déjà annulée'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            inscription.statut = 'ANNULEE'
            inscription.save()
            
            return Response({
                'success': True,
                'message': 'Inscription refusée avec succès',
                'data': self.get_serializer(inscription).data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
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
                return Response(
                    {'error': 'L\'inscription est requise'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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


class CommandeViewSet(AdminOnlyViewSet):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer


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
# ✅ PARTICIPATION ÉVÉNEMENT (PUBLIC + ADMIN)
# =============================================

@method_decorator(csrf_exempt, name='dispatch')
class ParticipationEvenementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les participations aux événements
    - CREATE : Public (AllowAny) - pour s'inscrire
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
        
        return queryset.order_by('-date_inscription')

    def create(self, request, *args, **kwargs):
        """
        ✅ Inscription à un événement (accessible au public)
        """
        try:
            data = request.data.copy()
            
            evenement_id = data.get('evenement')
            if not evenement_id:
                return Response(
                    {'error': 'L\'événement est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            evenement = get_object_or_404(Evenement, id=evenement_id)
            
            if evenement.places_restantes <= 0:
                return Response(
                    {'error': 'Cet événement est complet'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            email = data.get('email')
            if not email:
                return Response(
                    {'error': 'L\'email est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                client = Client.objects.get(email=email)
                created = False
            except Client.DoesNotExist:
                username = email.split('@')[0]
                if User.objects.filter(username=username).exists():
                    suffix = ''.join(random.choices(string.digits, k=4))
                    username = f"{username}{suffix}"
                
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=data.get('prenom', ''),
                    last_name=data.get('nom', '')
                )
                
                client = Client.objects.create(
                    user=user,
                    nom=data.get('nom', ''),
                    prenom=data.get('prenom', ''),
                    email=email,
                    telephone=data.get('telephone', ''),
                )
                created = True
            
            if not created:
                client.nom = data.get('nom', client.nom)
                client.prenom = data.get('prenom', client.prenom)
                client.telephone = data.get('telephone', client.telephone)
                client.save()
            
            existing_participation = ParticipationEvenement.objects.filter(
                evenement=evenement,
                client=client
            ).first()
            
            if existing_participation:
                return Response(
                    {'error': 'Vous êtes déjà inscrit à cet événement'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            participation = ParticipationEvenement.objects.create(
                evenement=evenement,
                client=client,
                statut='INSCRIT',
                notes=data.get('notes', '')
            )
            
            evenement.places_restantes -= 1
            evenement.save()
            
            serializer = self.get_serializer(participation)
            
            return Response({
                'success': True,
                'message': 'Inscription réussie',
                'data': serializer.data,
                'places_restantes': evenement.places_restantes,
                'client_created': created,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =============================================
# ✅ DASHBOARD STATS
# =============================================
# api/views.py - DashboardStatsView modifié

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
            
            # Inscriptions formations
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
            
            # Transactions récentes
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
            
            # Trier par date
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
            
            # ===== ✅ LISTE DES INSCRIPTIONS FORMATIONS EN ATTENTE =====
            inscriptions_attente = InscriptionFormation.objects.filter(
                statut='EN_ATTENTE'
            ).select_related('client', 'formation').order_by('-date_inscription')[:15]
            
            inscriptions_data = []
            for ins in inscriptions_attente:
                # Vérifier si un paiement existe
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
            
            return Response({
                'success': True,
                'stats': stats,
                'recent_activities': recent_activities,
                'monthly_stats': monthly_stats,
                'formation_stats': formation_stats,
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )