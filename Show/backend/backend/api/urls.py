# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# ===== ROUTER =====
router = DefaultRouter()

# Vos routes existantes
router.register(r'coach', views.CoachViewSet, basename='coach')
router.register(r'forfaits', views.ForfaitViewSet, basename='forfait')
router.register(r'evenements', views.EvenementViewSet, basename='evenement')
router.register(r'produits', views.ProduitViewSet, basename='produit')
router.register(r'rendezvous', views.RendezVousViewSet, basename='rendezvous')
router.register(r'panier', views.PanierViewSet, basename='panier')
router.register(r'commandes', views.CommandeViewSet, basename='commande')

# Routes Relooking
router.register(r'relooking-homme', views.RubriqueRelookingHommeViewSet, basename='relooking-homme')
router.register(r'relooking-femme', views.RubriqueRelookingFemmeViewSet, basename='relooking-femme')
router.register(r'ateliers', views.RubriqueAtelierViewSet, basename='ateliers')

# Routes Formations
router.register(r'formations', views.FormationEnLigneViewSet, basename='formations')
router.register(r'inscriptions-formation', views.InscriptionFormationViewSet, basename='inscriptions-formation')

# ===== AJOUTEZ CES ROUTES POUR LE PAIEMENT =====
router.register(r'moyens-paiement', views.MoyenPaiementViewSet, basename='moyens-paiement')
router.register(r'transactions', views.TransactionPaiementViewSet, basename='transactions')

# ===== URLS =====
urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('verifier-code/', views.VerifierCodeAccesView.as_view(), name='verifier-code'),
]