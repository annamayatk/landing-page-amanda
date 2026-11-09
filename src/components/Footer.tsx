export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-copy">
        <p>
          CREF: 065517-G/RJ · CRN4: 19100411
        </p>
        <p className="footer-small">
          <span className="footer-ig-icon" aria-hidden="true" />{' '}
          <a
            href="https://instagram.com/atkinson.personal"
            target="_blank"
            rel="noreferrer"
          >
            @atkinson.personal
          </a>{' '}
          · Consultoria personalizada de treinamento e nutrição.
        </p>
      </div>
      <a
        className="amw-selo"
        href="https://wa.me/5524988473876?text=Oi%20Anna!%20Vi%20um%20site%20que%20voc%C3%AA%20fez%20e%20quero%20um%20tamb%C3%A9m."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Site por Anna May WebDev. Falar no WhatsApp"
      >
        <img src="/selo-anna-may.png" alt="" width={16} height={23} />
        <span className="amw-nome">anna may</span>
        <span className="amw-tag">WEBDEV_</span>
      </a>
    </footer>
  )
}
