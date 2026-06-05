export interface TimeOfDay {
  icon: React.ReactNode;
  message: string;
  gradient: string;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

export interface Achievement {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
}
