interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:scale-[1.02]"
         style={{
           background: 'white',
           boxShadow: '0 0 15px rgba(255, 87, 34, 0.15), 0 0 5px rgba(255, 87, 34, 0.1)',
         }}>
      <h4 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h4>
      <p className="text-gray-700">
        {description}
      </p>
    </div>
  );
} 