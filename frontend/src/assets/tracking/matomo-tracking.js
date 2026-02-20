/**
 * =============================================================================
 * Matomo Tracking mit DSGVO-konformem Consent-Management
 * IT Warehouse AG · Visitor Tracking
 * =============================================================================
 *
 * Dieses Script:
 * 1. Zeigt ein Consent-Banner an (falls kein Consent vorhanden)
 * 2. Aktiviert Matomo-Tracking NUR nach aktiver Zustimmung
 * 3. Speichert Consent-Status in localStorage
 * 4. Bietet Opt-Out-Möglichkeit
 *
 * KONFIGURATION:
 * - MATOMO_URL: URL der Matomo-Installation
 * - MATOMO_SITE_ID: Site-ID in Matomo (pro Website unterschiedlich)
 *
 * EINBINDUNG:
 * Vor </body>:
 *   <link rel="stylesheet" href="consent-banner.css">
 *   <script src="matomo-tracking.js"></script>
 *
 * =============================================================================
 */

(function () {
  'use strict';

  // =========================================================================
  // KONFIGURATION – Pro Website anpassen!
  // =========================================================================
  var CONFIG = {
    matomoUrl: 'https://tracking.demo-itw.de/',
    siteId: '2', // 1=IT Warehouse, 2=SalesFunnel, 3=Portal, 4=SmartBAV
    consentKey: 'vt_consent',
    consentVersion: '1', // Erhöhen bei Änderung der Datenschutzerklärung
    datenschutzUrl: '/datenschutz',
  };

  // =========================================================================
  // Consent-Management
  // =========================================================================
  function getConsent() {
    try {
      var stored = localStorage.getItem(CONFIG.consentKey);
      if (!stored) return null;
      var data = JSON.parse(stored);
      // Consent ungültig wenn Version veraltet
      if (data.version !== CONFIG.consentVersion) return null;
      return data.granted;
    } catch (e) {
      return null;
    }
  }

  function setConsent(granted) {
    try {
      localStorage.setItem(
        CONFIG.consentKey,
        JSON.stringify({
          granted: granted,
          version: CONFIG.consentVersion,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      // localStorage nicht verfügbar
    }
  }

  // =========================================================================
  // Consent-Banner
  // =========================================================================
  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'vt-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML =
      '<div class="vt-consent-inner">' +
      '  <div class="vt-consent-text">' +
      '    <h3>Website-Analyse</h3>' +
      '    <p>Wir verwenden Matomo (selbst gehostet, keine Datenweitergabe an Dritte) ' +
      '    um unsere Website zu verbessern. Dabei werden Seitenaufrufe, Verweildauer ' +
      '    und Herkunft anonymisiert erfasst. ' +
      '    <a href="' + CONFIG.datenschutzUrl + '" target="_blank" rel="noopener">Datenschutz</a></p>' +
      '  </div>' +
      '  <div class="vt-consent-buttons">' +
      '    <button class="vt-btn-accept" id="vt-consent-accept">Akzeptieren</button>' +
      '    <button class="vt-btn-decline" id="vt-consent-decline">Ablehnen</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(banner);

    // Banner sichtbar machen (nach kurzem Delay für Animation)
    requestAnimationFrame(function () {
      banner.classList.add('vt-visible');
    });

    document.getElementById('vt-consent-accept').addEventListener('click', function () {
      setConsent(true);
      banner.classList.remove('vt-visible');
      setTimeout(function () { banner.remove(); }, 300);
      initMatomo();
    });

    document.getElementById('vt-consent-decline').addEventListener('click', function () {
      setConsent(false);
      banner.classList.remove('vt-visible');
      setTimeout(function () { banner.remove(); }, 300);
    });
  }

  // =========================================================================
  // Matomo Initialization
  // =========================================================================
  function initMatomo() {
    var _paq = (window._paq = window._paq || []);

    // Consent wurde erteilt
    _paq.push(['rememberConsentGiven']);

    // Tracking-Konfiguration
    _paq.push(['setTrackerUrl', CONFIG.matomoUrl + 'matomo.php']);
    _paq.push(['setSiteId', CONFIG.siteId]);

    // Erweiterte Tracking-Features
    _paq.push(['enableLinkTracking']);
    _paq.push(['enableHeartBeatTimer', 15]); // Alle 15 Sek Verweildauer aktualisieren
    _paq.push(['trackPageView']);

    // UTM-Parameter werden automatisch von Matomo erkannt
    // Campaign Tracking ist built-in

    // Matomo JS laden
    var d = document;
    var g = d.createElement('script');
    g.async = true;
    g.src = CONFIG.matomoUrl + 'matomo.js';
    var s = d.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(g, s);
  }

  // =========================================================================
  // SPA-Support (für Angular, React etc.)
  // Tracked Seitenwechsel ohne vollständigen Page Load
  // =========================================================================
  function trackSPAPageView(url, title) {
    if (window._paq) {
      window._paq.push(['setCustomUrl', url || window.location.href]);
      window._paq.push(['setDocumentTitle', title || document.title]);
      window._paq.push(['trackPageView']);
    }
  }

  // Globale Funktion für SPA-Frameworks
  window.vtTrackPageView = trackSPAPageView;

  // =========================================================================
  // Opt-Out Funktion (für Datenschutz-Seite)
  // =========================================================================
  window.vtRevokeConsent = function () {
    setConsent(false);
    if (window._paq) {
      window._paq.push(['forgetConsentGiven']);
    }
    // Matomo Cookies löschen
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf('_pk_') === 0 || cookie.indexOf('mtm_') === 0) {
        var name = cookie.split('=')[0];
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
    }
  };

  // =========================================================================
  // Initialisierung
  // =========================================================================
  function init() {
    var consent = getConsent();

    if (consent === true) {
      // Consent bereits erteilt → Matomo direkt starten
      initMatomo();
    } else if (consent === false) {
      // Consent abgelehnt → nichts tun
    } else {
      // Noch kein Consent → Banner zeigen
      createBanner();
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
