import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'

function Confetti() {
  const { width, height } = useWindowSize()

  return (
    <ReactConfetti width={width} height={height} />
  )
}

export default Confetti