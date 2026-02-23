'use client'

import Image from 'next/image'
import { Language, useAppState } from '@/core/state/app_state'
import { useAdvantages } from '../hooks/useAdvantages'
import { useIsMobileOrTablet } from '@/shared/hooks/useismobileortable'

export function WhyUsSection() {
  const appState = useAppState()
  const isBellowlg = useIsMobileOrTablet();
  const elementsNb = isBellowlg ? 6 : 3;
  const { advantages, getTitle, getDescription } = useAdvantages()
  

  return (
    <div className="w-full h-250 flex mt-10 lg:mb-15 mb-40 lg:scale-100 scale-85 flex-col items-center  justify-center bg-[#f7f7f7]">
      <h2 className="lg:text-6xl text-4xl font-bold text-[#08316E]" id="pourquoi-nous-choisir">
        {appState.lang === Language.FR ? 'Pourquoi Nous Choisir ?' : 'Why Choose Us ?'}
      </h2>

      {/* Première rangée (3 avantages) */}
      <div className="w-full lg:h-200 h-full  lg:flex items-center justify-center gap-15 mt-5  grid lg:grid-cols-3 grid-cols-2">
        {advantages.slice(0, elementsNb).map((advantage, index) => (
          <div
            key={index}
            className="lg:w-100 lg:h-110 w-55 h-85 bg-white rounded-3xl shadow-lg lg:p-6 -ml-2 flex flex-col items-center text-center lg:hover:scale-110 transition-transform"
          >
            <div className="lg:w-50 lg:h-45 mb-4" >
            <Image
              src={advantage.image}
              alt={getTitle(advantage, appState.lang)}
              width={110}
              height={80}
              className="mb-4 lg:w-full lg:h-full object-contain"
            />
            </div>
            <h3 className="lg:text-5xl text-2xl lg:-mt-5 -mt-10 font-semibold text-[#5E9FE9]">
              {getTitle(advantage, appState.lang)}
            </h3>
            <div className="lg:w-80 w-40 lg:h-px h-px bg-[#000000] lg:mb-4 mb-2" />
            <p className="text-gray-600 lg:text-2xl text-[16px] mt-2">
              {getDescription(advantage, appState.lang)}
            </p>
          </div>
        ))}
</div>
{!isBellowlg && (
  <>
    {/* Deuxième rangée (3 avantages) */}
    <div className="w-full lg:h-200 flex items-center justify-center  gap-15 mt-10 lg:grid-cols-3 grid-cols-2">
      {advantages.slice(3, 6).map((advantage, index) => (
        <div
          key={index}
          className="lg:w-100 lg:h-110 bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-110 transition-transform"
        >
          <Image
            src={advantage.image}
            alt={getTitle(advantage, appState.lang)}
            width={getTitle(advantage, appState.lang) === (appState.lang === Language.FR ? 'Simplicité' : 'Simplicity') ? 195 : 160}
            height={160}
          />
          <h3 className="text-5xl -mt-5 font-semibold text-[#5E9FE9]">
            {getTitle(advantage, appState.lang)}
          </h3>
          <div className="w-80 h-px bg-[#000000] mt-2 mb-4" />
          <p className="text-gray-600 text-2xl mt-2">
            {getDescription(advantage, appState.lang)}
          </p>
        </div>
      ))}
    </div>
  </>
)}
    </div>
  )
}