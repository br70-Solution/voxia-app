# 🧪 Instructions de Test - AudioPro Manager

## ✅ Correction du Mode Sombre (Dark Mode)

Le problème principal identifié était l'absence de la définition de la variante `dark` pour la stratégie "class" dans Tailwind CSS v4.

### 🛠️ Correction Appliquée
Dans `src/index.css`, ajout de la ligne :
```css
@variant dark (&:where(.dark, .dark *));
```
Cela permet à Tailwind v4 de reconnaître la classe `.dark` ajoutée au tag `<html>` ou `<body>` par le contexte React.

### 🔍 Comment Vérifier

1. **Ouvrir l'application**
   - Lancer `npm run preview` ou déployer sur Vercel.

2. **Activer le Mode Sombre**
   - Aller dans **Paramètres**.
   - Cliquer sur le toggle "Mode Sombre".
   - OU cliquer sur l'icône Lune/Soleil dans le header (en haut à droite).

3. **Vérification Visuelle**
   - Le fond de la page doit devenir sombre (`bg-slate-950` / `#020617`).
   - Le texte doit devenir clair (`text-slate-100`).
   - Les cartes doivent s'assombrir (`bg-slate-800`).

4. **Vérification Technique (Console DevTools)**
   - Inspecter l'élément `<html>` : il doit avoir la classe `dark`.
   - Inspecter l'élément `<body>` : il doit avoir la classe `dark` et le style `background-color: rgb(17, 24, 39)`.

## ⚙️ Persistance des Paramètres

Les paramètres sont sauvegardés dans le `localStorage`.
- Si vous rafraîchissez la page, le mode sombre doit rester actif s'il l'était.

## 🚀 Autres Tests Rapides

- **Navigation Sidebar** : Vérifier que la sidebar est bien sombre et contrastée.
- **Tableau de bord** : Vérifier que les graphiques et cartes s'affichent correctement en mode sombre.
- **Formulaires** : Ouvrir un modal (ex: Nouveau Patient) et vérifier que les inputs sont lisibles sur fond sombre.

L'application est maintenant prête avec un Dark Mode 100% fonctionnel sur Tailwind v4.
