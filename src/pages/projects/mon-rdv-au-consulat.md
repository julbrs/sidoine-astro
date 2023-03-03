---
layout: ../../layouts/ProjectLayout.astro
title: "Mon RDV au Consulat"
---

> 👉 Un bot Twitter qui permet d’avoir une alerte quand des créneaux pour renouveler son passeport sont disponible. Fonctionne sur la nouvelle plateforme de réservation de rendez-vous en ligne des consulats (Montréal, Londres, New-York pour le moment)

## A quoi ça sert?

En tant qu’expatrié, c’est pratique d’avoir un passeport français pour plein de bonnes raisons! Mais il n’est pas si simple de prendre un rendez-vous en ligne. Protocole sanitaire, augmentation de la population française expatriée, etc, aujourd’hui les créneaux sont difficile à obtenir!

[https://twitter.com/Ainaf_mtl/status/1467901878499434503](https://twitter.com/Ainaf_mtl/status/1467901878499434503)

Depuis peu, une nouvelle plateforme de réservation de RDV a été mise en place. Elle ne permet pas de résoudre le soucis des disponibilités, mais elle a l’avantage de proposer une API très pratique quand on veut automatiser certaines tâches!

[Accueil - Consulat Général De France À Montréal - Rendez-vous](https://consulat.gouv.fr/consulat-general-de-france-a-montreal/rendez-vous)

## Qu’est ce que c’est?

Un _bot Twitter_ est un compte Twitter opéré par un individu, mais dont les _tweets_ sont générés de manière automatique. En l’occurrence pour les comptes suivants, il vérifie toutes les 5 minutes si des créneaux sont disponible. Si c’est le cas (pas exemple ouverture de nouvelle journée de réservation, ou bien un créneau annulé par un usager) alors un nouveau tweet sera émis!

[https://twitter.com/RdvConsulat_Mtl/status/1515460179323674626](https://twitter.com/RdvConsulat_Mtl/status/1515460179323674626)

## Comment je m’en sert?

Il suffit de _suivre_ le compte Twitter qui nous intéresse, et de penser à **activer les notifications** 🔔 de l’application Twitter installé sur votre cellulaire:

- [RDV passeport à Montréal](https://twitter.com/RdvConsulat_Mtl)
- [RDV passeport à Londres](https://twitter.com/RdvConsulat_Lon)
- [RDV passeport à New-York](https://twitter.com/RdvConsulat_NY)

## Comment ça marche?

Comme dit plus haut, le script utilise l’API de la plateforme, ce n’est pas de la magie! 🧙Si la partie technique vous intéresse, j’ai écris un billet accessible [ici](https://www.notion.so/The-Twitter-Bot-That-Help-You-With-French-Consulate-Appointment-7401891652ad454099a074597ec25d95) (en anglais). Le concept est très inspiré du projet [Vaccélérateur](https://blog.transitapp.com/fr/accelerer-la-prise-de-rendez-vous-pour-la-vaccination-au-quebec-99b4124fd31a/) propulsé par [Transit](https://transitapp.com/)!

## Des feedbacks utilisateurs?

Oui j’ai ça!

- [https://twitter.com/SandBoiss/status/1520138539635204108](https://twitter.com/SandBoiss/status/1520138539635204108)
- [https://twitter.com/francky_hull/status/1521508649788715009](https://twitter.com/francky_hull/status/1521508649788715009)
- [https://twitter.com/didydulce/status/1523434815407591425?s=21&t=bQsbvCuggnPr6r_xO2HxvA](https://twitter.com/didydulce/status/1523434815407591425?s=21&t=bQsbvCuggnPr6r_xO2HxvA)

> Sincères remerciements pour l’API de prise de rdv. Ca faisait 4 mois qu’on avait besoin d’un rdv à Montréal pour un passeport ! Grâce à toi j ai eu un rdv en quelques minutes. Merci encore _Alexandre_

## J’ai des questions, des idées d’améliorations!

Pas de soucis! On peut en discuter sur [twitter 🐦](https://twitter.com/_julbrs).
