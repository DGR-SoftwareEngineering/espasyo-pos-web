import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import CategoryIcon from "@mui/icons-material/Category";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import CycloneIcon from "@mui/icons-material/Cyclone";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ListIcon from "@mui/icons-material/List";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import type { SvgIconComponent } from "@mui/icons-material";

export const ICON_REGISTRY: Record<string, SvgIconComponent> = {
  Home: HomeRoundedIcon,
  People: PeopleRoundedIcon,
  Inventory: InventoryRoundedIcon,
  Category: CategoryIcon,
  ProductionQuantityLimits: ProductionQuantityLimitsIcon,
  FoodBank: FoodBankIcon,
  Cyclone: CycloneIcon,
  PointOfSale: PointOfSaleRoundedIcon,
  Assignment: AssignmentRoundedIcon,
  Settings: SettingsRoundedIcon,
  Info: InfoRoundedIcon,
  Help: HelpRoundedIcon,
  AddCircle: AddCircleRoundedIcon,
  List: ListIcon,
  ReceiptLong: ReceiptLongRoundedIcon,
  Storefront: StorefrontRoundedIcon,
  Place: PlaceRoundedIcon,
  Scale: ScaleRoundedIcon,
  Kitchen: KitchenRoundedIcon,
  Tune: TuneRoundedIcon,
  Restore: RestoreRoundedIcon,
  ShoppingCart: ShoppingCartRoundedIcon,
  Add: AddIcon,
  LocalShipping: LocalShippingRoundedIcon,
  Payments: PaymentsRoundedIcon,
  AccountBalanceWallet: AccountBalanceWalletRoundedIcon,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

export const resolveIcon = (name: string | null | undefined): SvgIconComponent =>
  (name && ICON_REGISTRY[name]) || ListIcon;
