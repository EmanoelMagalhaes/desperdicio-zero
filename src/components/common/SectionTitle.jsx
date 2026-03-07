export default function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">{eyebrow}</div>
      ) : null}
      <h1 className="mt-3 text-3xl font-black md:text-5xl">{title}</h1>
      {text ? <p className="mt-4 max-w-3xl text-white/70 md:text-lg md:leading-8">{text}</p> : null}
    </div>
  );
}