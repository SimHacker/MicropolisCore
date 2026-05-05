<script>
  import { page } from '$app/stores';

  // Determine current year for copyright
  const currentYear = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="footer-content">
    <div class="copyright">
      &copy; {currentYear} Micropolis. <a href="/pages/micropolis-license">License</a>
    </div>
    <div class="footer-links">
      <a href="https://github.com/SimHacker/MicropolisCore" target="_blank" rel="noopener noreferrer">GitHub</a>
      <span class="footer-separator">|</span>
      <a href="https://www.patreon.com/DonHopkins" target="_blank" rel="noopener noreferrer">Support on Patreon</a>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    flex-shrink: 0;
    background-color: var(--rci-dirt-bg);
    padding: 0.5em 1em;
    border-top: 5px solid var(--rci-I-yellow, #ffc800);
    font-size: 0.85rem;
    color: var(--rci-text-light);
    z-index: 10;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em;
    max-width: var(--column-width);
    margin: 0 auto;
  }

  .copyright {
    margin-right: 1em;
  }

  .footer-links {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .footer-separator {
    color: var(--rci-text-light);
    opacity: 0.6;
  }

  a {
    color: var(--rci-text-light);
    text-decoration: underline;
    transition: color 0.15s ease;
  }

  a:hover {
    color: white;
    text-decoration: underline;
  }

  /* Ensure it's always visible at bottom on all pages */
  :global(.app-container) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style> 