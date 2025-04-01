import { NavLink } from 'react-router-dom'
import Waves from './components/Waves'
import './Landing.css'

function Landing() {
  return (
    <main className="landing">
      <header>
        <NavLink to="/">
          <h3 className="logo">HealthieFlow</h3>
        </NavLink>
      </header>

      <section className="hero row align-center justify-between">
        <div className="hero-text text-center column align-center">
          <h1>Organize Your Health</h1>
          <p>HealthieFlow makes it easy to manage your tasks and focus on what truly matters—your well-being</p>
          <NavLink to="/boards">Click Here To Get Started!</NavLink>
        </div>

        <div className="hero-image">
          <img src="/images/rick.png" alt="Rick holding a banner that reads ready to get healthie?" />
        </div>
      </section>

      <Waves />

      <section className="details">
        <article className="column">
          <div className="text-content text-center">
            <h2>Stay Organized, Stay Healthy</h2>
            <p>Plan, track, and achieve your goals with ease. HealthFlow helps you stay on top of what matters most</p>
          </div>
        </article>

        <article className="column">
          <div className="text-content text-center">
            <h2>Simplify Your Workflow, Empower Your Health</h2>
            <p>HealthieFlow helps you organize your tasks, track your progress, and achieve your goals—all in one place</p>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Landing 