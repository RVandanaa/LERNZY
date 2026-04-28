import { create } from 'zustand';

const useProfileStore = create((set) => ({
  // Profile fields
  name:      '',
  avatar:    null,   // emoji key e.g. 'owl'
  grade:     null,   // 1–12
  language:  null,   // single selection
  interests: [],     // multi-select

  // Setters
  setName:      (name)      => set({ name }),
  setAvatar:    (avatar)    => set({ avatar }),
  setGrade:     (grade)     => set({ grade }),
  setLanguage:  (language)  => set({ language }),
  toggleInterest: (interest) =>
    set((state) => ({
      interests: state.interests.includes(interest)
        ? state.interests.filter((i) => i !== interest)
        : [...state.interests, interest],
    })),

  resetProfile: () =>
    set({ name: '', avatar: null, grade: null, language: null, interests: [] }),
}));

export default useProfileStore;