import { CopyrightIcon, EmailIcon, GlobeIcon } from './assets/Icons'

import './Footer.css'

function Footer() {
  return (
    <footer className="main-footer row justify-center">
      <div className="text-content">
        <div className="row align-center">
          <p>Contact Us</p>
          <EmailIcon />
        </div>

        <div className="row align-center">
          <p>Visit Us</p>
          <GlobeIcon />
        </div>

        <div className="row align-center">
          <p>Copyright 2025</p>
          <CopyrightIcon />
        </div>

      </div>

      <div className="rick-surprise show">
        <img src="/images/rick2.png" alt="Picture of Rick holding up a sign that reads lets get Healthie" />
      </div>
    </footer>
  )
}

export default Footer