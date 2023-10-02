type SectionProps = JSX.IntrinsicElements["section"];

export const Section: React.FC<SectionProps> = ({ id, children, ...props }) => (
  <section id={id} {...props}>
    {children}
  </section>
);
