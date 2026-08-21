import { setRequestLocale } from "next-intl/server";

import { LessonNav } from "@/components/learn/lesson-nav";

export default async function LearnLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="sticky top-20 hidden h-fit w-60 shrink-0 lg:block">
        <LessonNav />
      </aside>

      <main className="min-w-0 flex-1 pb-16">
        <LessonNav variant="strip" />
        {children}
      </main>
    </div>
  );
}
