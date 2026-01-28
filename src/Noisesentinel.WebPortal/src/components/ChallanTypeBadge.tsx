import {
  CHALLAN_TYPE,
  ChallanType,
  getChallanTypeColorClass,
} from "@/utils/challanTypeHelper";

interface ChallanTypeBadgeProps {
  type: ChallanType;
  size?: "sm" | "md" | "lg";
}

export const ChallanTypeBadge: React.FC<ChallanTypeBadgeProps> = ({
  type,
  size = "md",
}) => {
  const colorClass = getChallanTypeColorClass(type);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${colorClass} ${sizeClasses[size]}`}
    >
      {type === CHALLAN_TYPE.NON_TRAFFIC ? "🔊 Non-Traffic" : "🚦 Traffic"}
    </span>
  );
};
