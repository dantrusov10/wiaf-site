import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { ThemeIcon } from '../components/ThemeIcon'
import { legalParagraphs, legalNote } from '../content/legal'

export function PrivacyPage() {
  const pd = legalParagraphs('pd')
  const policy = legalParagraphs('policy')

  return (
    <main>
      <PageHero
        kicker="152-ФЗ"
        title="Обработка персональных данных"
        dek="Условия обработки ПД и Политика ООО «ВИАФ» — перенос с прода на этот сайт."
      />
      <div className="mx-auto max-w-4xl space-y-10 px-5 py-12">
        <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-white p-4">
          <ThemeIcon id="rules" size={64} />
          <p className="min-w-0 flex-1 text-[13.5px] text-muted">{legalNote}</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold">Условия обработки персональной информации</h2>
          <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-muted">
            {pd.map((p, i) => (
              <p key={i}>{p.replace(/^#+\s*/, '')}</p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Политика ООО «ВИАФ» по обработке и защите ПД</h2>
          <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-muted">
            {policy.map((p, i) => (
              <p key={i}>{p.replace(/^#+\s*/, '')}</p>
            ))}
          </div>
        </section>

        <p className="text-[14px]">
          Полный комплект документов:{' '}
          <Link to="/rules" className="font-semibold text-brand underline">
            Правила и регламент
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
