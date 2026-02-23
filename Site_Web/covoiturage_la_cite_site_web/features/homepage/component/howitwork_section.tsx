'use client'

import Link from 'next/link'
import { useAppState, Language } from '@/core/state/app_state'
import { useHowItWorksSteps } from '../hooks/useHowItWorksSteps'

export function HowItWorkSection() {
  const appState = useAppState()
  const { steps, getTitle, getDescription, getLinkText } = useHowItWorksSteps()

  return (
    <div className="w-full lg:h-250 h-130 mt-10 flex flex-col items-center justify-center bg-[#08316E]">
      <h2 className="lg:text-6xl text-4xl lg:-mt-60 lg:mb-0 -mb-50 mt-10  font-bold text-white" id="comment-ca-marche">
        {appState.lang === Language.FR ? 'Comment ça marche ?' : 'How it works ?'}
      </h2>

      <div className="lg:-mt-50 -mt-10 lg:ml-40 h-180 grid grid-rows-3 -ml-70 relative w-full bg-transparent lg:scale-100 scale-45">
        <div className="w-full lg:h-200 h-180 flex flex-col  items-center justify-center gap-15 mt-10">
          {/* Première rangée (étapes 1 et 2) */}
          <div className="ml-50 w-full h-90 flex ">
              <div key={steps[0].number} className=' lg:pr-20 pr-40 border-r-2 border-gray-600' >
                <div className="flex flex-col items-center justify-center ml-25">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] lg:text-5xl text-6xl font-bold mr-4">
                    {steps[0].number}
                  </div>
                  <h3 className="text-3xl font-semibold text-white underline text-center">
                    {getTitle(steps[0], appState.lang)}
                  </h3>
                  <p className="text-white w-120 lg:text-3xl text-4xl text-center">
                    {steps[0].linkHref && steps[0].linkText && (
                      <Link
                        href={steps[0].linkHref}
                        className="text-blue-400 hover:underline hover:text-4xl transition-all active:text-blue-800"
                      >
                        {getLinkText(steps[0] , appState.lang)}
                      </Link>
                    )}
                    {getDescription(steps[0], appState.lang)}
                  </p>
                </div>
              </div> 
            <div key={steps[1].number}>
                <div className="flex flex-col items-center justify-center ml-25">
                  <div className="lg:w-20 lg:h-20 w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] lg:text-5xl text-6xl font-bold mr-4">
                    {steps[1].number}
                  </div>
                  <h3 className="lg:text-3xl  lg:w-full w-810 text-4xl font-semibold text-white m-5  underline text-center">
                    {getTitle(steps[1], appState.lang)}
                  </h3>
                  <p className="text-white w-120 lg:text-3xl text-4xl text-center">
                    {steps[1].linkHref && steps[1].linkText && (
                      <Link
                        href={steps[1].linkHref}
                        className="text-blue-400 hover:underline hover:text-4xl transition-all active:text-blue-800"
                      >
                        {getLinkText(steps[1] , appState.lang)}
                      </Link>
                    )}
                    {getDescription(steps[1], appState.lang)}
                  </p>
                </div>
              </div> 
          </div>
        </div>

        {/* Ligne horizontale */}
        <div className="lg:w-250 w-full lg:scale-100 scale-200 h-px lg:mt-90 mt-90 lg:ml-50 ml-85 bg-gray-600" />

        {/* Deuxième rangée (étapes 3 et 4) */}
        <div className="w-full lg:mt-40 ml-25 mt-40  h-90 flex">
          {steps.slice(2, 4).map((step) => (
            <div key={step.number} className={`${step.number === 3 ? 'lg:pr-20 pr-40 lg:-mt-5   border-r-2 border-gray-600' : ''}`}>
              <div className="flex flex-col items-center justify-center ml-25">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] text-5xl font-bold mr-4">
                  {step.number}
                </div>
                <h3 className="text-3xl font-semibold text-white m-5 underline text-center">
                  {getTitle(step, appState.lang)}
                </h3>
                <p className="text-white w-120 text-3xl text-center">
                  {getDescription(step, appState.lang)}
                </p>
              </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  )
}