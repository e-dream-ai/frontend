const PlaylistPlay = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 284 200"
    width="1.2em"
    height="1.2em"
    {...props}
  >
    <circle cx={20} cy={40} r={12} fill="currentColor" />
    <circle cx={20} cy={100} r={12} fill="currentColor" />
    <circle cx={20} cy={160} r={12} fill="currentColor" />
    <rect x={40} y={28} width={80} height={24} rx={12} fill="currentColor" />
    <rect x={40} y={88} width={80} height={24} rx={12} fill="currentColor" />
    <rect x={40} y={148} width={80} height={24} rx={12} fill="currentColor" />
    <g transform="translate(208,100) scale(0.55) translate(-165,-165)">
      <path
        d="M37.728,328.12c2.266,1.256,4.77,1.88,7.272,1.88              c2.763,0,5.522-0.763,7.95-2.28l240-149.999              c4.386-2.741,7.05-7.548,7.05-12.72              c0-5.172-2.664-9.979-7.05-12.72L52.95,2.28              c-4.625-2.891-10.453-3.043-15.222-0.4              C32.959,4.524,30,9.547,30,15v300              C30,320.453,32.959,325.476,37.728,328.12z"
        fill="currentColor"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  </svg>
);
export default PlaylistPlay;
