import { useState } from 'react'
import MixerBoard from './components/MixerBoard'
import TrainingPanel from './components/training/TrainingPanel'

export default function App() {
  const [trainingOpen, setTrainingOpen] = useState(false)

  return (
    <>
      <TrainingPanel open={trainingOpen} onToggle={() => setTrainingOpen(o => !o)} />
      <MixerBoard />
    </>
  )
}
