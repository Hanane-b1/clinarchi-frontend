# ClinArchi · Interface

Plateforme de programmation architecturale pour cliniques et hôpitaux. À partir du programme d'un projet, ClinArchi génère le plan de chaque étage, calcule les lits, les chambres et les surfaces, et produit un rapport professionnel.

Projet réalisé pendant mon stage de développeuse full stack chez Groupe Vitalys Santé (mars à avril 2026). L'API se trouve dans [clinarchi-backend](https://github.com/Hanane-b1/clinarchi-backend).

## Aperçu

<img alt="Page d'accueil" src="https://github.com/user-attachments/assets/af5a2470-420f-4ccb-a616-b72e03191687" />

### Du programme au plan

| Saisie des services | Plan architectural généré |
|---|---|
| <img alt="Saisie des services" src="https://github.com/user-attachments/assets/3a688f9f-699c-4feb-a7d4-27a4cbf6a3c5" /> | <img alt="Plan architectural" src="https://github.com/user-attachments/assets/4b30d910-95c7-46f9-a0a8-c33e36ad64c7" /> |

### Résultats

| Tableau des surfaces | Rapport rédigé par IA |
|---|---|
| <img alt="Tableau des surfaces" src="https://github.com/user-attachments/assets/64805747-a964-4c12-b278-f582cb08b376" /> | <img alt="Rapport" src="https://github.com/user-attachments/assets/6bb3a951-7996-46da-bf80-35c33f406340" /> |

### Export et historique

| Rapport PDF exporté | Historique des projets |
|---|---|
| <img alt="Export PDF" src="https://github.com/user-attachments/assets/bd479d2a-e0a4-42b6-8e88-1235777a0d7d" /> | <img alt="Historique des projets" src="https://github.com/user-attachments/assets/fb636f91-43ab-46e4-bdfb-a58f6062d62b" /> |

## Fonctionnalités

- **Paramétrage du projet** : nom de la clinique, ville, nombre de niveaux (RDC à R+4), sous-sols, parking et surface du terrain
- **Choix des services** : sélection des départements (hospitalisation, plateau technique, administration…) et des unités fonctionnelles, répartis par étage
- **Calculs automatiques** : total des lits et des chambres, surface nette et surface brute estimée
- **Plan architectural par étage** : un plan généré pour chaque niveau, consultable étage par étage
- **Rapport rédigé par IA** : résumé exécutif, organisation par niveau, pôles fonctionnels, recommandations et normes appliquées, avec un rapport de secours si l'IA est indisponible
- **Exports** : classeur Excel (programme, détail des surfaces, synthèse) et rapport PDF
- **Historique** : chaque projet généré est enregistré et peut être rouvert ou supprimé

## Technologies

React 19, Vite 7, CSS, SheetJS, jsPDF, html2canvas

## Installation

Prérequis : Node.js 18+ et le [backend](https://github.com/Hanane-b1/clinarchi-backend) démarré.

```bash
git clone https://github.com/Hanane-b1/clinarchi-frontend.git
cd clinarchi-frontend
npm install
```

Créer un fichier `.env` avec l'adresse de l'API :

```env
VITE_API_URL=http://localhost:8000
```

Puis lancer l'application :

```bash
npm run dev
```

L'application est disponible sur http://localhost:5173.

## Auteur

Hanane Belhadi
