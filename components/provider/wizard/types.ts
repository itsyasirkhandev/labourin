export type WizardStepId = 1 | 2 | 3 | 4 | 5;

export interface StepInfo {
	id: WizardStepId;
	title: string;
	shortTitle: string;
	description: string;
}

export const WIZARD_STEPS: StepInfo[] = [
	{
		id: 1,
		title: 'Identity & Experience',
		shortTitle: 'Identity',
		description: 'Your name, profile summary, and experience'
	},
	{
		id: 2,
		title: 'Services & Skills',
		shortTitle: 'Services',
		description: 'Primary trade category and specific skills'
	},
	{
		id: 3,
		title: 'Coverage & Contact',
		shortTitle: 'Coverage',
		description: 'Operating cities, areas, and contact details'
	},
	{
		id: 4,
		title: 'Identity Verification',
		shortTitle: 'Verification',
		description: 'CNIC details and document uploads'
	},
	{
		id: 5,
		title: 'Review & Submit',
		shortTitle: 'Review',
		description: 'Review details and submit for verification'
	}
];

export interface ProviderWizardFormData {
	displayName: string;
	bio: string;
	experienceYears: number;
	primaryCategoryId: string;
	skillIds: string[];
	cityId: string;
	areaIds: string[];
	phoneNumber: string;
	whatsappSameAsPhone: boolean;
	whatsappNumber: string;
	cnicNumber: string;
	cnicFrontStorageId: string;
	cnicBackStorageId: string;
	cnicFrontFileName?: string;
	cnicBackFileName?: string;
	termsAccepted: boolean;
}

export const INITIAL_WIZARD_FORM_DATA: ProviderWizardFormData = {
	displayName: '',
	bio: '',
	experienceYears: 1,
	primaryCategoryId: '',
	skillIds: [],
	cityId: '',
	areaIds: [],
	phoneNumber: '',
	whatsappSameAsPhone: true,
	whatsappNumber: '',
	cnicNumber: '',
	cnicFrontStorageId: '',
	cnicBackStorageId: '',
	cnicFrontFileName: '',
	cnicBackFileName: '',
	termsAccepted: false
};

export { isValidPakistaniPhone, isValidPakistaniCnic, formatCnicInput } from "@/lib/validation";

export function hasFormErrors<T extends Record<string, string>>(
  newErrors: T,
  setErrors: (errors: T) => void
): boolean {
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return true;
  }
  setErrors({} as T);
  return false;
}

export interface FallbackSkill {
	_id: string;
	name: string;
	isActive: boolean;
}

export interface FallbackCategory {
	_id: string;
	name: string;
	slug: string;
	isActive: boolean;
	skills: FallbackSkill[];
}

export interface FallbackArea {
	_id: string;
	name: string;
	isActive: boolean;
}

export interface FallbackCity {
	_id: string;
	name: string;
	code: string;
	isActive: boolean;
	areas: FallbackArea[];
}

export const FALLBACK_CATEGORIES: FallbackCategory[] = [
	{
		_id: 'fallback_cat_plumbing',
		name: 'Plumbing',
		slug: 'plumbing',
		isActive: true,
		skills: [
			{ _id: 'fallback_skill_pipe_repair', name: 'Pipe Leak Repair', isActive: true },
			{ _id: 'fallback_skill_fixture_install', name: 'Fixture & Tap Installation', isActive: true },
			{ _id: 'fallback_skill_drainage', name: 'Drainage Unclogging', isActive: true },
			{ _id: 'fallback_skill_geyser', name: 'Water Heater / Geyser Service', isActive: true }
		]
	},
	{
		_id: 'fallback_cat_electrical',
		name: 'Electrical Work',
		slug: 'electrical',
		isActive: true,
		skills: [
			{ _id: 'fallback_skill_wiring', name: 'House Wiring & Repair', isActive: true },
			{ _id: 'fallback_skill_appliance', name: 'Appliance Fitting', isActive: true },
			{ _id: 'fallback_skill_circuit', name: 'Circuit Breaker / Switchboard', isActive: true },
			{ _id: 'fallback_skill_ups', name: 'UPS & Solar Inverter Wiring', isActive: true }
		]
	},
	{
		_id: 'fallback_cat_carpentry',
		name: 'Carpentry',
		slug: 'carpentry',
		isActive: true,
		skills: [
			{ _id: 'fallback_skill_furniture_repair', name: 'Furniture Repair & Polish', isActive: true },
			{ _id: 'fallback_skill_door_lock', name: 'Door & Lock Fitting', isActive: true },
			{ _id: 'fallback_skill_cabinet', name: 'Custom Cabinetry & Wardrobes', isActive: true }
		]
	},
	{
		_id: 'fallback_cat_painting',
		name: 'Painting & Renovation',
		slug: 'painting',
		isActive: true,
		skills: [
			{ _id: 'fallback_skill_interior_paint', name: 'Interior Wall Painting', isActive: true },
			{ _id: 'fallback_skill_exterior_paint', name: 'Exterior Weather Shield', isActive: true },
			{ _id: 'fallback_skill_waterproofing', name: 'Roof Waterproofing & Sealing', isActive: true }
		]
	},
	{
		_id: 'fallback_cat_hvac',
		name: 'HVAC & AC Service',
		slug: 'hvac',
		isActive: true,
		skills: [
			{ _id: 'fallback_skill_ac_install', name: 'AC Mounting & Installation', isActive: true },
			{ _id: 'fallback_skill_ac_service', name: 'AC Master Chemical Cleaning', isActive: true },
			{ _id: 'fallback_skill_ac_gas', name: 'Gas Refill & Leak Testing', isActive: true }
		]
	}
];

export const FALLBACK_CITIES: FallbackCity[] = [
	{
		_id: 'fallback_city_lahore',
		name: 'Lahore',
		code: 'LHR',
		isActive: true,
		areas: [
			{ _id: 'fallback_area_gulberg', name: 'Gulberg I, II, III', isActive: true },
			{ _id: 'fallback_area_dha_lhr', name: 'DHA Phases 1-8', isActive: true },
			{ _id: 'fallback_area_johartown', name: 'Johar Town', isActive: true },
			{ _id: 'fallback_area_model_town', name: 'Model Town', isActive: true },
			{ _id: 'fallback_area_iqbal_town', name: 'Allama Iqbal Town', isActive: true },
			{ _id: 'fallback_area_cantt_lhr', name: 'Lahore Cantt', isActive: true }
		]
	},
	{
		_id: 'fallback_city_karachi',
		name: 'Karachi',
		code: 'KHI',
		isActive: true,
		areas: [
			{ _id: 'fallback_area_clifton', name: 'Clifton & Bath Island', isActive: true },
			{ _id: 'fallback_area_dha_khi', name: 'DHA Phases 1-8', isActive: true },
			{ _id: 'fallback_area_gulshan', name: 'Gulshan-e-Iqbal', isActive: true },
			{ _id: 'fallback_area_pechs', name: 'P.E.C.H.S', isActive: true },
			{ _id: 'fallback_area_nazimabad', name: 'North Nazimabad', isActive: true }
		]
	},
	{
		_id: 'fallback_city_islamabad',
		name: 'Islamabad',
		code: 'ISB',
		isActive: true,
		areas: [
			{ _id: 'fallback_area_f6_f7', name: 'Sectors F-6 & F-7', isActive: true },
			{ _id: 'fallback_area_f8_f10', name: 'Sectors F-8, F-10 & F-11', isActive: true },
			{ _id: 'fallback_area_g6_g9', name: 'Sectors G-6 to G-11', isActive: true },
			{ _id: 'fallback_area_i8_i9', name: 'Sectors I-8 & I-9', isActive: true },
			{ _id: 'fallback_area_dha_isb', name: 'DHA Islamabad', isActive: true },
			{ _id: 'fallback_area_bahria_isb', name: 'Bahria Town Islamabad', isActive: true }
		]
	},
	{
		_id: 'fallback_city_rawalpindi',
		name: 'Rawalpindi',
		code: 'RWP',
		isActive: true,
		areas: [
			{ _id: 'fallback_area_saddar_rwp', name: 'Saddar & Cantt', isActive: true },
			{ _id: 'fallback_area_satellite', name: 'Satellite Town', isActive: true },
			{ _id: 'fallback_area_bahria_rwp', name: 'Bahria Town Phases 1-8', isActive: true },
			{ _id: 'fallback_area_scheme3', name: 'Chaklala Scheme 3', isActive: true }
		]
	}
];
