# api/urls.py
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from .views import CommandeDepuisPanierView
from .views import (
    CustomTokenObtainView,
    CustomTokenRefreshView,
    CurrentUserView,
    DashboardStatsView,
    RequestOTPView,
    VerifyOTPView,
    RegisterView,
    ClientRegisterView,   
    ClientLoginView,
    PanierView,
    PaiementViewSet,
    FormationEnLigneViewSet,
    EvenementViewSet,
    ProduitViewSet,
    ForfaitViewSet,
    RubriqueRelookingFemmeViewSet,
    RubriqueRelookingHommeViewSet,
    RubriqueAtelierViewSet,
    CoachViewSet,
    ActualiteViewSet,
    FAQViewSet,
    ClientViewSet,
    RendezVousViewSet,
    ParticipationEvenementViewSet,
    PanierViewSet,
    CommandeViewSet,
    CodeAccesFormationViewSet,
    InscriptionFormationViewSet,
    MoyenPaiementViewSet,
    TransactionPaiementViewSet,
    AvisProduitViewSet,
    PromotionViewSet,
    WishlistViewSet,
    ContactMessageViewSet,
    NotificationViewSet,
    AdminLogViewSet,
    SiteSettingsViewSet,AdminInscriptionRelookingViewSet,InscriptionRelookingView
)

router = DefaultRouter()

# =============================================
# ✅ ROUTES PUBLIQUES
# =============================================
router.register(r'formations', FormationEnLigneViewSet, basename='formations')
router.register(r'evenements', EvenementViewSet, basename='evenements')
router.register(r'produits', ProduitViewSet, basename='produits')
router.register(r'forfaits', ForfaitViewSet, basename='forfaits')
router.register(r'relooking-femme', RubriqueRelookingFemmeViewSet, basename='relooking-femme')
router.register(r'relooking-homme', RubriqueRelookingHommeViewSet, basename='relooking-homme')
router.register(r'ateliers', RubriqueAtelierViewSet, basename='ateliers')
router.register(r'coach', CoachViewSet, basename='coach')
router.register(r'actualites', ActualiteViewSet, basename='actualites')
router.register(r'faq', FAQViewSet, basename='faq')
router.register(r'moyens-paiement', MoyenPaiementViewSet, basename='moyens-paiement')
router.register(r'participations', ParticipationEvenementViewSet, basename='participations')
router.register(r'paiements', PaiementViewSet, basename='paiements-public')
router.register(r'inscriptions-formation', InscriptionFormationViewSet, basename='inscriptions-formation')
router.register(r'transactions', TransactionPaiementViewSet, basename='transactions')

# ✅ Route publique pour la création de commandes
router.register(r'commandes', CommandeViewSet, basename='commandes-public')

# =============================================
# ✅ ROUTES ADMIN (avec préfixe admin)
# =============================================
router.register(r'admin/clients', ClientViewSet, basename='admin-clients')
router.register(r'admin/rendezvous', RendezVousViewSet, basename='admin-rendezvous')
router.register(r'admin/participations', ParticipationEvenementViewSet, basename='admin-participations')
router.register(r'admin/paniers', PanierViewSet, basename='admin-paniers')
router.register(r'admin/commandes', CommandeViewSet, basename='admin-commandes')

router.register(r'admin/codes-acces', CodeAccesFormationViewSet, basename='admin-codes-acces')
router.register(r'admin/inscriptions-formation', InscriptionFormationViewSet, basename='admin-inscriptions-formation')
router.register(r'admin/moyens-paiement', MoyenPaiementViewSet, basename='admin-moyens-paiement')
router.register(r'admin/transactions', TransactionPaiementViewSet, basename='admin-transactions')
router.register(r'admin/avis-produits', AvisProduitViewSet, basename='admin-avis-produits')
router.register(r'admin/promotions', PromotionViewSet, basename='admin-promotions')
router.register(r'admin/wishlists', WishlistViewSet, basename='admin-wishlists')
router.register(r'admin/contacts', ContactMessageViewSet, basename='admin-contacts')
router.register(r'admin/notifications', NotificationViewSet, basename='admin-notifications')
router.register(r'admin/admin-logs', AdminLogViewSet, basename='admin-admin-logs')
router.register(r'admin/site-settings', SiteSettingsViewSet, basename='admin-site-settings')
router.register(r'admin/inscriptions-relooking', AdminInscriptionRelookingViewSet, basename='admin-inscriptions-relooking')
# =============================================
# ✅ URL PATTERNS
# =============================================
urlpatterns = [
    path('token/', CustomTokenObtainView.as_view(), name='token_obtain'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    
    path('send-otp/', csrf_exempt(RequestOTPView.as_view()), name='send-otp'),
    path('verify-otp/', csrf_exempt(VerifyOTPView.as_view()), name='verify-otp'),
    path('register/', csrf_exempt(RegisterView.as_view()), name='register'),
    
    path('', include(router.urls)),
    
    # ✅ Routes Client
    path('client/register/', csrf_exempt(ClientRegisterView.as_view()), name='client-register'),
    path('client/login/', csrf_exempt(ClientLoginView.as_view()), name='client-login'),
    path('client/panier/<int:client_id>/', csrf_exempt(PanierView.as_view()), name='client-panier'),
    path('client/panier/<int:client_id>/commander/', csrf_exempt(CommandeDepuisPanierView.as_view()), name='commande-depuis-panier'),
    
    path('admin/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('inscriptions-relooking/', csrf_exempt(InscriptionRelookingView.as_view()), name='inscription-relooking-create'),
    path('verifier-code/', InscriptionFormationViewSet.as_view({'post': 'verifier_code'}), name='verifier-code'),
]