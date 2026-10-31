import type { ChildProfile } from '../types';
import { calculateAgeFromBirthDate } from '../utils/ecdAssessment';
import { supabase } from './supabase';

type ChildRow = {
  id: string;
  name: string;
  status: 'expecting' | 'born';
  birth_date: string | null;
  due_date: string | null;
  gender: 'girl' | 'boy' | 'other' | null;
  buddy: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export function rowToChild(row: ChildRow, partnerCode = ''): ChildProfile {
  const isPregnant = row.status === 'expecting';
  const birthDate = row.birth_date ?? row.due_date ?? today();
  const age = isPregnant ? { ageMonths: 0, ageDays: 0 } : calculateAgeFromBirthDate(birthDate);
  return {
    id: row.id,
    nameBn: row.name,
    nameEn: row.name,
    nicknameBn: 'বাবু',
    nicknameEn: 'Baby',
    gender: row.gender === 'other' || !row.gender ? 'unknown' : row.gender,
    birthDate,
    ageMonths: age.ageMonths,
    ageDays: age.ageDays,
    isPregnant,
    expectedDueDate: row.due_date ?? undefined,
    avatarSeed: row.buddy ?? row.name,
    mascotId: row.buddy ?? undefined,
    currentLeap: isPregnant ? 0 : age.ageMonths <= 6 ? 4 : age.ageMonths <= 9 ? 5 : 6,
    motherNameBn: 'আম্মু',
    motherNameEn: 'Mother',
    partnerCode,
    linkedPartners: [],
    currentWeightKg: 0,
    currentHeightCm: 0,
    todayMood: 'happy',
  };
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? null } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function updateProfile(userId: string, patch: { full_name?: string; parent_role?: string; language?: string }) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function createChild(profile: ChildProfile): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('children')
    .insert({
      name: profile.nameBn || profile.nameEn,
      status: profile.isPregnant ? 'expecting' : 'born',
      birth_date: profile.isPregnant ? null : profile.birthDate,
      due_date: profile.isPregnant ? profile.expectedDueDate ?? null : null,
      gender: profile.gender === 'unknown' ? 'other' : profile.gender,
      buddy: profile.mascotId ?? null,
    })
    .select('id,name,status,birth_date,due_date,gender,buddy')
    .single();
  if (error) throw error;
  return { ...profile, ...rowToChild(data as ChildRow), mascotNameBn: profile.mascotNameBn };
}

export async function loadChildren(): Promise<ChildProfile[]> {
  const { data, error } = await supabase
    .from('children')
    .select('id,name,status,birth_date,due_date,gender,buddy')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as ChildRow[]).map((row) => rowToChild(row));
}

export async function updateChildRow(id: string, patch: Partial<ChildProfile>) {
  const update: Record<string, unknown> = {};
  if (patch.nameBn) update.name = patch.nameBn;
  if (patch.birthDate && !patch.isPregnant) update.birth_date = patch.birthDate;
  if (patch.gender) update.gender = patch.gender === 'unknown' ? 'other' : patch.gender;
  if (patch.mascotId) update.buddy = patch.mascotId;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from('children').update(update).eq('id', id);
  if (error) throw error;
}

/** Returns an active partner code for a child (creates one if none), shown as KUCHU-XXXXXXXX. */
export async function getOrCreatePartnerCode(childId: string): Promise<string> {
  const { data } = await supabase
    .from('partner_invites')
    .select('code')
    .eq('child_id', childId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (data?.code) return `KUCHU-${data.code}`;
  const { data: created, error } = await supabase
    .from('partner_invites')
    .insert({ child_id: childId })
    .select('code')
    .single();
  if (error) throw error;
  return `KUCHU-${created.code}`;
}

/** Redeems a partner code; returns the child id the user was added to. */
export async function redeemPartnerCode(input: string): Promise<string> {
  const code = input.trim().toUpperCase().replace(/^KUCHU-/, '');
  const { data, error } = await supabase.rpc('redeem_partner_code', { p_code: code });
  if (error) throw error;
  return data as string;
}
