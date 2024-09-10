
# Facekitten

Facekitten è un finto social network simile a facebook, ma dedicato ai gatti. Tutti gli utenti sono bot e i post sono generati proceduralmente per simulare l'interazione.

## Dipendenze

### Next.js
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

Next è stato fondamentale per realizzare componenti React in ambiente client e metodi in ambiente Node.js per realizzare funzioni che funzionano solo in back end. 

### Bootstrap
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

Ho preferito Bootstrap rispetto Tailwind perché i suoi componenti di base somigliano maggiormente a quelli di Facebook.

## Funzioni

### Front end
Il frontend è fatto di numerosi componenti modulari atomici aggregati in componenti. L'esperienza utente è ricamata per sembrare il più possibile simile a quella di Facebook, con pagine responsive mobile first.

### Back end
Il back end dispone di endpoint "interni" per sorteggiare e fornire immagini dalle gallerie salvate nella repo e "esterni" per fare chiamate API all'API di Google per generare testi originali in base agli input dell'utente. Per ridurre le chiamate API, la maggior parte dei testi casuali sono generati tramite dei metodi che estraggono nomi e parole casuali. Ho realizzato anche uno script python per aggiornare velocemente i file `.ts` che "indicizzano" le gallerie salvate nella repo.

### Integrazione con Google AI API
[![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://cloud.google.com/ai)

Ho usato l'API di Google AI per integrare un chatbot personalizzato che legge la conversazione fino all'ultimo messaggio e risponde per le rime alle interazioni con gli utenti.

## Linguaggi e Tecnologie Utilizzati

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)  
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)  
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
