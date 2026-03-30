'use client'

export function FlowProgressBar({
  currentQuestionIndex,
  totalQuestions,
  currentCategoryIndex,
  categoriesLength,
  progressPercent,
  answeredCount,
  totalAllQuestions,
}) {
  return (
    <div className="container mx-auto px-4 pb-4 -mt-2">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Soru {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span>
            Kategori {currentCategoryIndex + 1} / {categoriesLength}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-center text-muted-foreground">
          Toplam ilerleme: {answeredCount} / {totalAllQuestions} soru cevaplandı
        </div>
      </div>
    </div>
  )
}
