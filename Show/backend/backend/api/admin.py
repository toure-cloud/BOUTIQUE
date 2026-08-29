from django.contrib import admin
# api/admin.py

from django.contrib import admin
from .models import *

@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'email', 'experience']
    search_fields = ['nom', 'prenom', 'email']

@admin.register(Forfait)
class ForfaitAdmin(admin.ModelAdmin):
    list_display = ['nom', 'type', 'prix', 'duree', 'est_actif']
    list_filter = ['type', 'est_actif']
    search_fields = ['nom', 'description']

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'email', 'telephone']
    search_fields = ['nom', 'prenom', 'email']

@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ['client', 'coach', 'date_rendez_vous', 'statut']
    list_filter = ['statut', 'date_rendez_vous']
    search_fields = ['client__nom', 'client__prenom']

@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ['titre', 'theme', 'date_debut', 'places_restantes', 'statut']
    list_filter = ['statut', 'est_gratuit']
    search_fields = ['titre', 'theme']

@admin.register(ParticipationEvenement)
class ParticipationEvenementAdmin(admin.ModelAdmin):
    list_display = ['evenement', 'client', 'date_inscription', 'statut']
    list_filter = ['statut', 'date_inscription']

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prix', 'categorie', 'quantite_stock', 'est_disponible']
    list_filter = ['categorie', 'est_disponible', 'est_en_promotion']
    search_fields = ['nom', 'description']

@admin.register(Panier)
class PanierAdmin(admin.ModelAdmin):
    list_display = ['client', 'date_creation', 'est_valide']
    list_filter = ['est_valide']

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'date_commande', 'statut', 'total']
    list_filter = ['statut']
    search_fields = ['client__nom', 'client__prenom']
# Register your models here.
