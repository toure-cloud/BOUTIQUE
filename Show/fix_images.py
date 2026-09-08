# fix_missing_images.py
import os
import sys
import django
from pathlib import Path

sys.path.append('/home/toure/Bureau/BOUTIQUE/Show/backend/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import FormationEnLigne, Evenement, Produit
from django.core.files import File
from django.conf import settings

def verifier_et_corriger_images():
    """Vérifie et corrige les images manquantes"""
    media_root = Path(settings.MEDIA_ROOT)
    
    print(f"📁 Dossier media: {media_root}")
    print("=" * 60)
    
    # Vérifier les formations
    print("\n📝 Vérification des formations...")
    for formation in FormationEnLigne.objects.all():
        if formation.image:
            chemin = formation.image.path if hasattr(formation.image, 'path') else None
            if chemin and not os.path.exists(chemin):
                print(f"  ❌ Image manquante: {formation.titre} - {formation.image}")
                # Assigner une image par défaut ou supprimer
                formation.image = None
                formation.save()
                print(f"     ✅ Image supprimée pour {formation.titre}")
            else:
                print(f"  ✅ OK: {formation.titre}")
    
    # Vérifier les événements
    print("\n📝 Vérification des événements...")
    for evenement in Evenement.objects.all():
        if evenement.image:
            chemin = evenement.image.path if hasattr(evenement.image, 'path') else None
            if chemin and not os.path.exists(chemin):
                print(f"  ❌ Image manquante: {evenement.titre} - {evenement.image}")
                evenement.image = None
                evenement.save()
                print(f"     ✅ Image supprimée pour {evenement.titre}")
            else:
                print(f"  ✅ OK: {evenement.titre}")
    
    # Vérifier les produits
    print("\n📝 Vérification des produits...")
    for produit in Produit.objects.all():
        if produit.image_principale:
            chemin = produit.image_principale.path if hasattr(produit.image_principale, 'path') else None
            if chemin and not os.path.exists(chemin):
                print(f"  ❌ Image manquante: {produit.nom} - {produit.image_principale}")
                produit.image_principale = None
                produit.save()
                print(f"     ✅ Image supprimée pour {produit.nom}")
            else:
                print(f"  ✅ OK: {produit.nom}")
    
    print("\n" + "=" * 60)
    print("✨ Vérification terminée !")

if __name__ == "__main__":
    verifier_et_corriger_images()