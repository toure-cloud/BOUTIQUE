# api/views.py - DOIT COMMENCER PAR CE TYPE D'IMPORTS

from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404

# ⚠️ IMPORTANT : Importez les modèles depuis models.py, ne les définissez PAS ici
from .models import (
    Coach, Forfait, Client, RendezVous, Evenement, 
    ParticipationEvenement, Produit, Panier, LignePanier,
    Commande, LigneCommande, RubriqueRelookingHomme,
    RubriqueRelookingFemme, RubriqueAtelier,
    FormationEnLigne, CodeAccesFormation, InscriptionFormation,
    MoyenPaiement, TransactionPaiement
)

from .serializers import (
    UserSerializer, UserCreateSerializer,
    CoachSerializer, CoachSimpleSerializer,
    ForfaitSerializer,
    ClientSerializer, ClientCreateSerializer,
    RendezVousSerializer, RendezVousCreateSerializer,
    EvenementSerializer, EvenementDetailSerializer,
    ParticipationEvenementSerializer, ParticipationEvenementCreateSerializer,
    ProduitSerializer, ProduitDetailSerializer,
    LignePanierSerializer, PanierSerializer,
    CommandeSerializer, CommandeCreateSerializer,
    RubriqueRelookingHommeSerializer,
    RubriqueRelookingFemmeSerializer,
    RubriqueAtelierSerializer,
    FormationEnLigneSerializer,
    CodeAccesFormationSerializer,
    InscriptionFormationSerializer,
    InscriptionFormationCreateSerializer,
    MoyenPaiementSerializer,
    TransactionPaiementSerializer,
    TransactionPaiementCreateSerializer,
)

# ============================================================
# VUES AUTHENTIFICATION
# ============================================================

class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur"""
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    """Récupérer l'utilisateur courant"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# ============================================================
# VUES COACH
# ============================================================

class CoachViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour le coach (lecture seule pour le public)"""
    queryset = Coach.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CoachSimpleSerializer
        return CoachSerializer


# ============================================================
# VUES FORFAITS
# ============================================================

class ForfaitViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les forfaits"""
    queryset = Forfait.objects.filter(est_actif=True).order_by('-created_at')
    serializer_class = ForfaitSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def par_type(self, request):
        """Récupérer les forfaits par type"""
        type_forfait = request.query_params.get('type', None)
        if type_forfait:
            queryset = self.get_queryset().filter(type=type_forfait)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({'error': 'Paramètre type requis'}, status=400)


# ============================================================
# VUES RENDEZ-VOUS
# ============================================================

class RendezVousViewSet(viewsets.ModelViewSet):
    """ViewSet pour les rendez-vous"""
    serializer_class = RendezVousSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return RendezVous.objects.all()
        try:
            client = Client.objects.get(user=user)
            return RendezVous.objects.filter(client=client)
        except Client.DoesNotExist:
            return RendezVous.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RendezVousCreateSerializer
        return RendezVousSerializer
    
    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        rendezvous = self.get_object()
        if rendezvous.statut in ['ANNULE', 'TERMINE']:
            return Response(
                {'error': 'Ce rendez-vous ne peut pas être annulé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rendezvous.statut = 'ANNULE'
        rendezvous.save()
        return Response({'message': 'Rendez-vous annulé avec succès'})
    
    @action(detail=True, methods=['post'])
    def confirmer(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission non accordée'},
                status=status.HTTP_403_FORBIDDEN
            )
        rendezvous = self.get_object()
        if rendezvous.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Ce rendez-vous ne peut pas être confirmé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rendezvous.statut = 'CONFIRME'
        rendezvous.save()
        return Response({'message': 'Rendez-vous confirmé avec succès'})


# ============================================================
# VUES ÉVÉNEMENTS
# ============================================================

class EvenementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les événements"""
    queryset = Evenement.objects.all().order_by('-date_debut')
    serializer_class = EvenementSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Evenement.objects.all().order_by('-date_debut')
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EvenementDetailSerializer
        return EvenementSerializer
    
    @action(detail=True, methods=['post'])
    def participer(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Vous devez être connecté pour participer'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        evenement = self.get_object()
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Vous devez compléter votre profil client'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ParticipationEvenementCreateSerializer(data={
            'evenement': evenement.id,
            'client': client.id,
            'notes': request.data.get('notes', '')
        })
        
        if serializer.is_valid():
            with transaction.atomic():
                participation = serializer.save()
                evenement.places_restantes -= 1
                evenement.save()
            return Response(
                {'message': 'Inscription réussie !', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# VUES PRODUITS
# ============================================================

# api/views.py
class ProduitViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les produits (lecture seule pour le public)"""
    queryset = Produit.objects.filter(
        est_disponible=True, 
        quantite_stock__gt=0
    ).order_by('-created_at')  # ⚠️ AJOUTEZ order_by ici aussi
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProduitDetailSerializer
        return ProduitSerializer
    
    @action(detail=False, methods=['get'])
    def par_categorie(self, request):
        categorie = request.query_params.get('categorie', None)
        if categorie:
            queryset = self.get_queryset().filter(categorie=categorie)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({'error': 'Paramètre categorie requis'}, status=400)
    
    @action(detail=False, methods=['get'])
    def promotion(self, request):
        queryset = self.get_queryset().filter(est_en_promotion=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============================================================
# VUES PANIER
# ============================================================

class PanierViewSet(viewsets.ModelViewSet):
    """ViewSet pour le panier"""
    serializer_class = PanierSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            client = Client.objects.get(user=self.request.user)
            return Panier.objects.filter(client=client, est_valide=False)
        except Client.DoesNotExist:
            return Panier.objects.none()
    
    def get_or_create_panier(self, client):
        panier, created = Panier.objects.get_or_create(
            client=client,
            est_valide=False
        )
        return panier
    
    @action(detail=False, methods=['post'])
    def ajouter_produit(self, request):
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Vous devez compléter votre profil client'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        produit_id = request.data.get('produit_id')
        quantite = request.data.get('quantite', 1)
        
        try:
            produit = Produit.objects.get(id=produit_id, est_disponible=True)
        except Produit.DoesNotExist:
            return Response(
                {'error': 'Produit non disponible'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if produit.quantite_stock < quantite:
            return Response(
                {'error': f'Stock insuffisant. Disponible: {produit.quantite_stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        panier = self.get_or_create_panier(client)
        ligne, created = LignePanier.objects.get_or_create(
            panier=panier,
            produit=produit,
            defaults={
                'quantite': quantite,
                'prix_unitaire': produit.prix_actuel
            }
        )
        
        if not created:
            ligne.quantite += quantite
            ligne.save()
        
        serializer = self.get_serializer(panier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def valider_panier(self, request):
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        panier = self.get_or_create_panier(client)
        
        if not panier.lignes.exists():
            return Response(
                {'error': 'Le panier est vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        adresse_livraison = request.data.get('adresse_livraison')
        if not adresse_livraison:
            return Response(
                {'error': 'Adresse de livraison requise'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            commande_data = {
                'client': client.id,
                'adresse_livraison': adresse_livraison,
                'notes': request.data.get('notes', '')
            }
            commande_serializer = CommandeCreateSerializer(data=commande_data)
            
            if not commande_serializer.is_valid():
                return Response(commande_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            commande = commande_serializer.save()
            total = 0
            for ligne in panier.lignes.all():
                LigneCommande.objects.create(
                    commande=commande,
                    produit=ligne.produit,
                    quantite=ligne.quantite,
                    prix_unitaire=ligne.prix_unitaire
                )
                produit = ligne.produit
                produit.quantite_stock -= ligne.quantite
                produit.save()
                total += ligne.sous_total
            
            commande.total = total
            commande.save()
            panier.est_valide = True
            panier.save()
        
        return Response(
            {'message': 'Commande créée avec succès', 'commande_id': commande.id},
            status=status.HTTP_201_CREATED
        )


# ============================================================
# VUES COMMANDES
# ============================================================

class CommandeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les commandes"""
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Commande.objects.all().order_by('-date_commande')
        try:
            client = Client.objects.get(user=user)
            return Commande.objects.filter(client=client).order_by('-date_commande')
        except Client.DoesNotExist:
            return Commande.objects.none()


# ============================================================
# VUES RELOOKING
# ============================================================

class RubriqueRelookingHommeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RubriqueRelookingHomme.objects.filter(est_actif=True).order_by('ordre')
    serializer_class = RubriqueRelookingHommeSerializer
    permission_classes = [AllowAny]


class RubriqueRelookingFemmeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RubriqueRelookingFemme.objects.filter(est_actif=True).order_by('ordre')
    serializer_class = RubriqueRelookingFemmeSerializer
    permission_classes = [AllowAny]


class RubriqueAtelierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RubriqueAtelier.objects.filter(est_actif=True).order_by('ordre')
    serializer_class = RubriqueAtelierSerializer
    permission_classes = [AllowAny]


# ============================================================
# VUES FORMATIONS
# ============================================================

class FormationEnLigneViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les formations en ligne"""
    queryset = FormationEnLigne.objects.filter(est_actif=True).order_by('ordre', 'date_live')
    serializer_class = FormationEnLigneSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset
    
    @action(detail=True, methods=['get'])
    def live_status(self, request, pk=None):
        formation = self.get_object()
        return Response({
            'est_live': formation.est_live,
            'est_replay': formation.est_replay,
            'statut': formation.statut,
            'statut_label': formation.get_statut_display(),
        })


class InscriptionFormationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les inscriptions aux formations"""
    serializer_class = InscriptionFormationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            client = Client.objects.get(user=user)
            return InscriptionFormation.objects.filter(client=client)
        except Client.DoesNotExist:
            return InscriptionFormation.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InscriptionFormationCreateSerializer
        return InscriptionFormationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            client = Client.objects.get(user=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Vous devez avoir un profil client pour vous inscrire'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mutable_data = request.data.copy()
        mutable_data['client'] = client.id
        
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def generer_code(self, request, pk=None):
        inscription = self.get_object()
        
        if inscription.statut != 'PAYEE':
            return Response(
                {'error': 'Le paiement doit être effectué avant de générer le code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if inscription.code_acces:
            return Response(
                {'error': 'Un code d\'accès a déjà été généré'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        import secrets
        code = ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(12))
        date_expiration = timezone.now() + timedelta(days=1)
        
        code_acces = CodeAccesFormacion.objects.create(
            formation=inscription.formation,
            client=inscription.client,
            code=code,
            date_expiration=date_expiration,
            montant_paye=inscription.montant,
            reference_paiement=inscription.reference_paiement
        )
        
        inscription.code_acces = code_acces
        inscription.save()
        
        return Response({
            'message': 'Code d\'accès généré avec succès',
            'code': code,
            'date_expiration': date_expiration,
            'formation': inscription.formation.titre
        }, status=status.HTTP_201_CREATED)


# ============================================================
# VUES PAIEMENT
# ============================================================

class MoyenPaiementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les moyens de paiement disponibles"""
    queryset = MoyenPaiement.objects.filter(est_actif=True).order_by('ordre')
    serializer_class = MoyenPaiementSerializer
    permission_classes = [AllowAny]


class TransactionPaiementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les transactions de paiement"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            client = Client.objects.get(user=user)
            return TransactionPaiement.objects.filter(
                inscription__client=client
            ).order_by('-date_creation')
        except Client.DoesNotExist:
            return TransactionPaiement.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionPaiementCreateSerializer
        return TransactionPaiementSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        inscription = serializer.validated_data['inscription']
        if inscription.client.user != request.user:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à payer pour cette inscription'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if inscription.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Cette inscription n\'est pas en attente de paiement'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirmer_paiement(self, request, pk=None):
        transaction = self.get_object()
        
        transaction.statut = 'REUSSI'
        transaction.date_validation = timezone.now()
        transaction.save()
        
        inscription = transaction.inscription
        inscription.statut = 'PAYEE'
        inscription.reference_paiement = transaction.reference
        inscription.save()
        
        import secrets
        code = ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(12))
        date_expiration = timezone.now() + timedelta(days=1)
        
        code_acces = CodeAccesFormation.objects.create(
            formation=inscription.formation,
            client=inscription.client,
            code=code,
            date_expiration=date_expiration,
            montant_paye=transaction.montant,
            reference_paiement=transaction.reference
        )
        
        inscription.code_acces = code_acces
        inscription.save()
        
        return Response({
            'message': 'Paiement confirmé avec succès !',
            'code_acces': code,
            'date_expiration': date_expiration,
            'formation': inscription.formation.titre
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def annuler_paiement(self, request, pk=None):
        transaction = self.get_object()
        
        if transaction.statut not in ['EN_ATTENTE', 'EN_COURS']:
            return Response(
                {'error': 'Cette transaction ne peut pas être annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction.statut = 'ANNULE'
        transaction.save()
        
        return Response({'message': 'Paiement annulé avec succès'}, status=status.HTTP_200_OK)


# ============================================================
# VUE VÉRIFICATION CODE
# ============================================================

class VerifierCodeAccesView(generics.GenericAPIView):
    """Vérifier la validité d'un code d'accès"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code')
        formation_id = request.data.get('formation_id')
        
        if not code or not formation_id:
            return Response(
                {'error': 'Code et formation requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            code_acces = CodeAccesFormation.objects.get(
                code=code,
                formation_id=formation_id
            )
        except CodeAccesFormation.DoesNotExist:
            return Response(
                {'error': 'Code invalide'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not code_acces.est_utilisable:
            if code_acces.statut == 'UTILISE':
                return Response(
                    {'error': 'Ce code a déjà été utilisé'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if code_acces.date_expiration < timezone.now():
                return Response(
                    {'error': 'Ce code a expiré'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        code_acces.statut = 'UTILISE'
        code_acces.date_utilisation = timezone.now()
        code_acces.save()
        
        return Response({
            'valid': True,
            'message': 'Code valide. Accès autorisé.',
            'formation': code_acces.formation.titre,
            'video_url': code_acces.formation.video_url or code_acces.formation.replay_url
        })