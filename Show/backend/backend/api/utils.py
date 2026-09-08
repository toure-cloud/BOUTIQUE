# api/utils.py
from datetime import timedelta
from django.utils import timezone

def envoyer_sms_confirmation(client, commande, produit, quantite, total):
    """
    Simule l'envoi d'un SMS de confirmation.
    En production, utilisez une API SMS (Twilio, Orange SMS, etc.)
    """
    date_livraison = timezone.now() + timedelta(days=2)
    
    message = (
        f"Tibetia: Merci {client.prenom} {client.nom} ! "
        f"Votre commande #{commande.id} de {quantite} x {produit.nom} "
        f"d'un montant de {total} CFA est confirmée. "
        f"Livraison prévue le {date_livraison.strftime('%d/%m/%Y')}."
    )
    
    # ⚠️ En local, on affiche le SMS dans la console du serveur Django
    print(f"\n📱 SMS envoyé à {client.telephone}:\n{message}\n")
    
    # Optionnel : Enregistrer le SMS dans votre base de données
    # Notification.objects.create(
    #     client=client,
    #     type='COMMANDE',
    #     titre='Confirmation de commande',
    #     message=message,
    # )