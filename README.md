# siren.io-actapublica
Web Service plugin for Acta Publica on Siren.io investigative platform

You need to setup client_id and client_secret in investigate.yml:

    web_services:
      investigative-acta-docs:
        config:
          client_id: "XXX"
          client_secret: "YYY"
      global:
        enabled: true
