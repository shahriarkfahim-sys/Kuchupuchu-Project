import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  PlusCircle, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  User, 
  ShieldCheck,
  ChevronDown,
  X
} from 'lucide-react';
import { CommunityPost, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

interface CommunitySectionProps {
  currentLang: Language;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  posts: CommunityPost[];
  onAddPost: (post: CommunityPost) => void;
  onToggleUpvote: (postId: string) => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  currentLang,
  isLoggedIn,
  onRequireLogin,
  posts,
  onAddPost,
  onToggleUpvote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<'sleep' | 'food' | 'milestones' | 'health' | 'play'>('sleep');
  const [expandedReplies, setExpandedReplies] = useState<{ [postId: string]: boolean }>({ cp_1: true });

  const categories = [
    { id: 'all', labelBn: 'সকল আলোচনা', labelEn: 'All Topics' },
    { id: 'sleep', labelBn: 'ঘুম ও কান্না', labelEn: 'Sleep & Night' },
    { id: 'food', labelBn: 'খাবার ও পুষ্টি', labelEn: 'Feeding & Nutrition' },
    { id: 'milestones', labelBn: 'মাইলস্টোন ও অগ্রগতি', labelEn: 'Milestones' },
    { id: 'health', labelBn: 'স্বাস্থ্য ও যত্ন', labelEn: 'Health & Care' },
  ];

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleOpenQuestionModal = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setIsQuestionModalOpen(true);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const created: CommunityPost = {
      id: `cp_${Date.now()}`,
      authorName: currentLang === 'bn' ? 'অভিভাবক সদস্য' : 'Parent Member',
      authorRole: currentLang === 'bn' ? 'মা/বাবা' : 'Parent',
      childAgeBn: 'বাবু: ৯ মাস',
      childAgeEn: 'Baby: 9m',
      timeAgoBn: 'এখনই',
      timeAgoEn: 'Just now',
      category: newCategory,
      titleBn: newTitle,
      titleEn: newTitle,
      bodyBn: newBody,
      bodyEn: newBody,
      upvotes: 1,
      isUpvoted: true,
      replies: [],
    };

    onAddPost(created);
    setNewTitle('');
    setNewBody('');
    setIsQuestionModalOpen(false);
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="community" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D53] uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'অভিভাবক কমিউনিটি ফোরাম' : 'Parent Discussion Forum'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3142] tracking-tight mt-1">
            {currentLang === 'bn' ? 'অভিভাবকদের অভিজ্ঞতা ও প্রশ্নোত্তর' : 'Ask & Connect with Other Parents'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6479] mt-1 max-w-2xl leading-relaxed">
            {currentLang === 'bn'
              ? 'সন্তানের ঘুম, খাওয়া বা কোনো অগ্রগতিমূলক উদ্বেগে একা অনুভব করবেন না। অন্য বাবা-মা ও বিশেষজ্ঞদের সাথে খোলামেলা আলোচনা করুন।'
              : 'Share experiences and find comforting advice on feeding, sleep, and milestones from certified experts and fellow parents.'}
          </p>
        </div>

        <button
          onClick={handleOpenQuestionModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-2xl text-xs transition-colors shrink-0 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'নতুন প্রশ্ন বা অভিজ্ঞতা লিখুন' : 'Ask a Question'}</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-[#FF8552] text-white border-[#FF8552] shadow-xs'
                : 'bg-white text-[#5C6479] border-[#EED9C7] hover:border-[#FFB07C]'
            }`}
          >
            {currentLang === 'bn' ? cat.labelBn : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Forum Discussion Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const hasReplies = post.replies && post.replies.length > 0;
          const isRepliesOpen = expandedReplies[post.id];
          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-[#EED9C7] p-5 sm:p-6 shadow-xs hover:border-[#FFB07C] transition-all space-y-4"
            >
              {/* Post Author Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFE4D3] text-[#C85D26] flex items-center justify-center font-bold text-xs">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <span className="font-bold text-[#2D3142]">{post.authorName}</span>
                    <span className="text-[#8C6D53] text-[11px] ml-1.5">({post.authorRole})</span>
                    <span aria-hidden="true" className="text-[#D8C2B0] mx-1.5">·</span>
                    <span className="text-[#7C8294] text-[11px]">
                      {currentLang === 'bn' ? post.childAgeBn : post.childAgeEn}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-[#7C8294]">
                  {currentLang === 'bn' ? post.timeAgoBn : post.timeAgoEn}
                </span>
              </div>

              {/* Title and Body */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2D3142] leading-snug">
                  {currentLang === 'bn' ? post.titleBn : post.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C6479] leading-relaxed">
                  {currentLang === 'bn' ? post.bodyBn : post.bodyEn}
                </p>
              </div>

              {/* Bottom Action Bar: Upvotes & Replies Toggle */}
              <div className="pt-2 border-t border-[#F3E7DC] flex items-center justify-between gap-3 text-xs">
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleUpvote(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                      post.isUpvoted
                        ? 'bg-[#FFF0E2] border-[#FF8552] text-[#C85D26] font-bold'
                        : 'bg-[#FFFAF5] border-[#EED9C7] text-[#5C6479] hover:border-[#FFB07C]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{formatLocalizedNumber(post.upvotes, currentLang)}</span>
                    <span className="hidden sm:inline">{currentLang === 'bn' ? 'সহমত' : 'Upvote'}</span>
                  </button>

                  <button
                    onClick={() => toggleReplies(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFAF5] border border-[#EED9C7] text-[#5C6479] hover:border-[#FFB07C] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {formatLocalizedNumber(post.replies?.length || 0, currentLang)}{' '}
                      {currentLang === 'bn' ? 'টি উত্তর' : 'replies'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={handleOpenQuestionModal}
                  className="text-xs font-semibold text-[#FF8552] hover:text-[#E67332] underline"
                >
                  {currentLang === 'bn' ? 'মতামত দিন' : 'Reply'}
                </button>
              </div>

              {/* Expanded Replies Thread */}
              {isRepliesOpen && hasReplies && (
                <div className="mt-3 pt-3 border-t border-[#F3E7DC] space-y-2.5 pl-3 sm:pl-6 border-l-2 border-[#FFD9B3]">
                  {post.replies.map((rep) => (
                    <div key={rep.id} className="bg-[#FFFAF5] p-3 rounded-2xl border border-[#F0D5C1] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#2D3142]">{rep.authorName}</span>
                          <span className="text-[#8C6D53]">({rep.authorRole})</span>
                        </div>
                        <span className="text-[#7C8294]">{rep.timeAgoBn}</span>
                      </div>
                      <p className="text-xs text-[#5C6479] leading-relaxed">
                        {currentLang === 'bn' ? rep.bodyBn : rep.bodyEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* New Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#F3E7DC] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'কমিউনিটিতে প্রশ্ন বা অভিজ্ঞতা লিখুন' : 'Post to Parent Community'}
                </h3>
                <p className="text-xs text-[#7C8294] mt-0.5">
                  {currentLang === 'bn' ? 'অভিজ্ঞ অভিভাবক ও শিশু ডাক্তাররা উত্তর দেবেন' : 'Fellow parents and pediatric specialists will respond'}
                </p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'বিষয় / ক্যাটাগরি' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                >
                  <option value="sleep">{currentLang === 'bn' ? 'ঘুম ও রাতের কান্না' : 'Sleep & Crying'}</option>
                  <option value="food">{currentLang === 'bn' ? 'খাবার ও পুষ্টি' : 'Feeding & Food'}</option>
                  <option value="milestones">{currentLang === 'bn' ? 'মাইলস্টোন ও শারীরিক অগ্রগতি' : 'Milestones'}</option>
                  <option value="health">{currentLang === 'bn' ? 'স্বাস্থ্য ও সতর্কতা' : 'Health'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'আপনার প্রশ্নের মূল কথা (শিরোনাম)' : 'Question Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'যেমন: ৯ মাসের সন্তান রাতে বারবার জেগে উঠছে...' : 'e.g., Baby waking up frequently at 9 months...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'কী সমস্যা হচ্ছে, কতদিন ধরে হচ্ছে বা আপনি কী চেষ্টা করেছেন বিস্তারিত লিখুন...' : 'Add details about your baby’s situation...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#2D3142]"
                >
                  {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {currentLang === 'bn' ? 'পোস্ট প্রকাশ করুন' : 'Publish Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
