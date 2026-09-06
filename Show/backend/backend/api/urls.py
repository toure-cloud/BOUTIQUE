# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainView,
    CustomTokenRefreshView,
    CurrentUserView,
    DashboardStatsView,
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
    SiteSettingsViewSet,
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
router.register(r'paiements', PaiementViewSet, basename='paiements')
router.register(r'inscriptions-formation', InscriptionFormationViewSet, basename='inscriptions-formation')
router.register(r'transactions', TransactionPaiementViewSet, basename='transactions')

# =============================================
# ✅ ROUTES ADMIN
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
router.register(r'admin/paiements', PaiementViewSet, basename='admin-paiements')

urlpatterns = [
    path('token/', CustomTokenObtainView.as_view(), name='token_obtain'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
    path('admin/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]