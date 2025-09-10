import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  addDoc,
  Timestamp,
  Query,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { 
  User, 
  VideoEngagement, 
  VideoStats, 
  ChatMessage, 
  UserProfile, 
  Notification,
  DashboardStats,
  UserAnalytics
} from './types';

// Video Name Mapping - Maps video IDs to human-readable names based on actual app content
const VIDEO_NAME_MAP: Record<string, string> = {
  // 0-3 Months Videos
  'vmEHfOIf3M8': 'Rooting Reflex',
  'cnNg9oghuc8': 'Sucking Reflex',
  'IpJz812Jslo': 'Swallowing',
  'BIb2ruMlmRo': 'Startling to loud noises',
  '9X8jjFlzX1Y': 'Consolability',
  'llJ6DcIi7c8': 'Social smile',
  'Y0MbbbzhRrw': 'Cooing sound',
  'VIfB33mAdLo': 'Symmetry of hand movements',
  '7S9j30fKYvU': 'Symmetry of leg movements',
  'o2UXGUPsnD4': 'Head Stability',
  'bTgc-hyMNIQ': 'Following objects with eyes',
  'f18SUlyJbJA': 'Keeping hands over chest',
  
  // 4-6 Months Videos
  '6MqV75uroG4': 'Response to rattle or bell',
  'XQt3Q363lAw': 'Using both hands equally',
  'eghObLb8i2g': 'Turning to one side',
  'KJIeFr6WcPQ': 'Put toy in the mouth',
  'LRNYakP5byo': 'Holds head steady while sitting with support',
  'JkG3cnvuEho': 'Reaching out to pick up an object',
  'yvi1V-WaOoQ': 'Pronouncing simple words',
  'bQ57j8nc_sQ': 'Turning head towards sounds',
  'JtRBQs_Xq4o': 'Rolling over from back to tummy',
  'LVY8jGcwDRs': 'Babbling and imitating sounds',
  '0st__3eDn2M': 'Smiling at the mirror',
  
  // 7-9 Months Videos
  'lnFqXal9l2w': 'Hip flexibility',
  'e8yIkcKvgFc': 'Looking down at dropped toys',
  'flVHUfD2DtE': 'Sits with own hand supported on the floor',
  'ONIuVolMzpU': 'Reaching for out of reach toys',
  'DLaddLe8x9o': 'Searching for hidden toys',
  '0r-T16fHULw': 'Listen when your baby uses "Amma" and "Appa"',
  '_uBO52aLhe4': 'Starting to crawl',
  'JP44oUguU6s': 'Passing toy between hands',
  'ZiFvUvRt26Y': 'Waving "Bye-Bye"',
  
  // 10-12 Months Videos
  'ARWC00IfAvo': 'Imitating words',
  'qE-vUPDWI5g': 'Pointing and naming',
  '5nuwScdws1U': 'Sitting without support',
  'lLdO-9TKHnY': 'Standing with support',
  '3Qy4cEqX_UY': 'Crawling using hands and knees',
  'iIWaQdcmI2Q': 'Pat-a-cake',
  '3gSogttQIvY': 'Sitting up from lying down',
  'bWgTOWZcFuE': 'Playing peek-a-boo',
  'F0K4oN8RcUo': 'Joint attention',
  'pf_idoKpXYs': 'Picking up small objects',
  'PPITg2_NPcs': 'Playing with others',
  'JlEc_QnzSmU': 'Walking with support',
  '-JzUNTk-jmA': 'Drinking from a cup',
  
  // Tamil videos - using the same English names for simplicity
  'lZpDz-yq3TI': 'Rooting Reflex (Tamil)',
  'g5BF_4VmRww': 'Sucking Reflex (Tamil)',
  'UoHxgOYIZFE': 'Swallowing (Tamil)',
  'DCTcOSrQpNw': 'Startling to loud noises (Tamil)',
  '7TiVyAefjhA': 'Consolability (Tamil)',
  'KRBBzniZvU0': 'Social smile (Tamil)',
  'thC2XEt2r44': 'Cooing sound (Tamil)',
  '_oPTLw9iyyk': 'Symmetry of hand movements (Tamil)',
  '4IfghZgAm_U': 'Symmetry of leg movements (Tamil)',
  '-2YnzBkh6vo': 'Head Stability (Tamil)',
};

// Get video name from ID, fallback to shortened ID if not found
export function getVideoName(videoId: string): string {
  return VIDEO_NAME_MAP[videoId] || `Video ${videoId.slice(0, 8)}...`;
}

// Get video category based on video ID
export function getVideoCategory(videoId: string): string {
  // Extract YouTube ID if a full URL is provided
  const id = extractYouTubeId(videoId) || videoId;
  
  // Get the video name
  const videoName = getVideoName(id);
  
  // 0-3 Months videos
  if (['vmEHfOIf3M8', 'cnNg9oghuc8', 'IpJz812Jslo', 'BIb2ruMlmRo', '9X8jjFlzX1Y', 
       'llJ6DcIi7c8', 'Y0MbbbzhRrw', 'VIfB33mAdLo', '7S9j30fKYvU', 'o2UXGUPsnD4',
       'bTgc-hyMNIQ', 'f18SUlyJbJA', 'lZpDz-yq3TI', 'g5BF_4VmRww', 'UoHxgOYIZFE'].includes(id)) {
    return '0-3 Months';
  }
  
  // 4-6 Months videos
  if (['6MqV75uroG4', 'XQt3Q363lAw', 'eghObLb8i2g', 'KJIeFr6WcPQ', 'LRNYakP5byo',
       'JkG3cnvuEho', 'yvi1V-WaOoQ', 'bQ57j8nc_sQ', 'JtRBQs_Xq4o', 'LVY8jGcwDRs',
       '0st__3eDn2M'].includes(id)) {
    return '4-6 Months';
  }
  
  // 7-9 Months videos
  if (['lnFqXal9l2w', 'e8yIkcKvgFc', 'flVHUfD2DtE', 'ONIuVolMzpU', 'DLaddLe8x9o',
       '0r-T16fHULw', '_uBO52aLhe4', 'JP44oUguU6s', 'ZiFvUvRt26Y'].includes(id)) {
    return '7-9 Months';
  }
  
  // 10-12 Months videos
  if (['ARWC00IfAvo', 'qE-vUPDWI5g', '5nuwScdws1U', 'lLdO-9TKHnY', '3Qy4cEqX_UY',
       'iIWaQdcmI2Q', '3gSogttQIvY', 'bWgTOWZcFuE', 'F0K4oN8RcUo', 'pf_idoKpXYs',
       'PPITg2_NPcs', 'JlEc_QnzSmU', '-JzUNTk-jmA'].includes(id)) {
    return '10-12 Months';
  }
  
  // Categorize by video name patterns if ID not recognized
  if (videoName.toLowerCase().includes('reflex') || 
      videoName.toLowerCase().includes('head stability') ||
      videoName.toLowerCase().includes('symmetry')) {
    return '0-3 Months';
  } else if (videoName.toLowerCase().includes('sitting with support') || 
             videoName.toLowerCase().includes('turning') ||
             videoName.toLowerCase().includes('rolling')) {
    return '4-6 Months';
  } else if (videoName.toLowerCase().includes('crawl') || 
             videoName.toLowerCase().includes('reaching') ||
             videoName.toLowerCase().includes('hidden toys')) {
    return '7-9 Months';
  } else if (videoName.toLowerCase().includes('stand') || 
             videoName.toLowerCase().includes('walk') ||
             videoName.toLowerCase().includes('cup')) {
    return '10-12 Months';
  }
  
  return 'Development';
}

// Get developmental skill category based on video name
export function getDevelopmentalCategory(videoName: string): string {
  if (videoName.toLowerCase().includes('reflex') || 
      videoName.toLowerCase().includes('grasp') || 
      videoName.toLowerCase().includes('crawling') ||
      videoName.toLowerCase().includes('sitting') ||
      videoName.toLowerCase().includes('walking') ||
      videoName.toLowerCase().includes('hand') ||
      videoName.toLowerCase().includes('leg') ||
      videoName.toLowerCase().includes('head') ||
      videoName.toLowerCase().includes('stand')) {
    return 'Motor Skills';
  } else if (videoName.toLowerCase().includes('sound') || 
             videoName.toLowerCase().includes('word') || 
             videoName.toLowerCase().includes('babbling') ||
             videoName.toLowerCase().includes('imitating') ||
             videoName.toLowerCase().includes('cooing')) {
    return 'Communication';
  } else if (videoName.toLowerCase().includes('social') || 
             videoName.toLowerCase().includes('smile') || 
             videoName.toLowerCase().includes('playing') ||
             videoName.toLowerCase().includes('others')) {
    return 'Social-Emotional';
  } else if (videoName.toLowerCase().includes('following') || 
             videoName.toLowerCase().includes('object') || 
             videoName.toLowerCase().includes('searching') ||
             videoName.toLowerCase().includes('attention')) {
    return 'Cognitive';
  }
  return 'Development';
}

// Extract YouTube ID from a URL
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Handle both standard YouTube URLs and shorts
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  return null;
}

// User Management
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      last_active: doc.data().last_active?.toDate(),
    } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
        created_at: userDoc.data().created_at?.toDate(),
        last_active: userDoc.data().last_active?.toDate(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Video Analytics
export async function getAllVideoStats(): Promise<VideoStats[]> {
  try {
    const statsSnapshot = await getDocs(
      query(collection(db, 'video_stats'), orderBy('total_views', 'desc'))
    );
    return statsSnapshot.docs.map(doc => ({
      video_id: doc.id,
      video_name: getVideoName(doc.id),
      ...doc.data()
    } as VideoStats));
  } catch (error) {
    console.error('Error fetching video stats:', error);
    return [];
  }
}

export async function getVideoEngagements(videoId?: string): Promise<VideoEngagement[]> {
  try {
    let q: Query<DocumentData> | CollectionReference<DocumentData>;
    if (videoId) {
      q = query(collection(db, 'video_engagement'), where('video_id', '==', videoId));
    } else {
      q = collection(db, 'video_engagement');
    }
    
    const engagementsSnapshot = await getDocs(q);
    return engagementsSnapshot.docs.map(doc => ({
      ...doc.data(),
      last_viewed: doc.data().last_viewed?.toDate(),
    } as VideoEngagement));
  } catch (error) {
    console.error('Error fetching video engagements:', error);
    return [];
  }
}

// Get detailed video analytics with user information
export async function getVideoAnalyticsWithUsers(videoId: string): Promise<{
  videoStats: VideoStats | null;
  engagements: VideoEngagement[];
  users: User[];
}> {
  try {
    const [videoStatsDoc, engagementsSnapshot, usersSnapshot] = await Promise.all([
      getDoc(doc(db, 'video_stats', videoId)),
      getDocs(query(collection(db, 'video_engagement'), where('video_id', '==', videoId))),
      getDocs(collection(db, 'users'))
    ]);

    const videoStats = videoStatsDoc.exists() ? {
      video_id: videoStatsDoc.id,
      ...videoStatsDoc.data()
    } as VideoStats : null;

    const engagements = engagementsSnapshot.docs.map(doc => ({
      ...doc.data(),
      last_viewed: doc.data().last_viewed?.toDate(),
    } as VideoEngagement));

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      last_active: doc.data().last_active?.toDate(),
    } as User));

    return { videoStats, engagements, users };
  } catch (error) {
    console.error('Error fetching video analytics with users:', error);
    return { videoStats: null, engagements: [], users: [] };
  }
}

// Get engagement summary for all videos
export async function getVideoEngagementSummary(): Promise<{
  videoId: string;
  totalViews: number;
  uniqueViewers: number;
  approvals: number;
  disapprovals: number;
  engagementRate: number;
  topEngagedUsers: { userId: string; userName: string; viewCount: number }[];
}[]> {
  try {
    const [videoStatsSnapshot, engagementsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'video_stats')),
      getDocs(collection(db, 'video_engagement')),
      getDocs(collection(db, 'users'))
    ]);

    const users = usersSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = {
        id: doc.id,
        ...doc.data(),
      } as User;
      return acc;
    }, {} as Record<string, User>);

    const videoStats = videoStatsSnapshot.docs.map(doc => ({
      video_id: doc.id,
      ...doc.data()
    } as VideoStats));

    const engagements = engagementsSnapshot.docs.map(doc => ({
      ...doc.data(),
      last_viewed: doc.data().last_viewed?.toDate(),
    } as VideoEngagement));

    return videoStats.map(video => {
      const videoEngagements = engagements.filter(e => e.video_id === video.video_id);
      const uniqueViewers = new Set(videoEngagements.map(e => e.user_id)).size;
      const approvals = videoEngagements.filter(e => e.vote === 'approve').length;
      const disapprovals = videoEngagements.filter(e => e.vote === 'disapprove').length;
      const engagementRate = video.total_views > 0 ? ((approvals + disapprovals) / video.total_views) * 100 : 0;

      // Get top engaged users for this video
      const userEngagementMap = videoEngagements.reduce((acc, e) => {
        if (!acc[e.user_id]) {
          acc[e.user_id] = 0;
        }
        acc[e.user_id] += e.view_count;
        return acc;
      }, {} as Record<string, number>);

      const topEngagedUsers = Object.entries(userEngagementMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, viewCount]) => ({
          userId,
          userName: users[userId]?.name || 'Unknown User',
          viewCount
        }));

      return {
        videoId: video.video_id,
        totalViews: video.total_views,
        uniqueViewers,
        approvals,
        disapprovals,
        engagementRate,
        topEngagedUsers
      };
    });
  } catch (error) {
    console.error('Error fetching video engagement summary:', error);
    return [];
  }
}

export async function getUserEngagements(userId: string): Promise<VideoEngagement[]> {
  try {
    const engagementsSnapshot = await getDocs(
      query(collection(db, 'video_engagement'), where('user_id', '==', userId))
    );
    return engagementsSnapshot.docs.map(doc => ({
      ...doc.data(),
      last_viewed: doc.data().last_viewed?.toDate(),
    } as VideoEngagement));
  } catch (error) {
    console.error('Error fetching user engagements:', error);
    return [];
  }
}

// Dashboard Statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [usersSnapshot, videoStatsSnapshot, engagementsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'video_stats')),
      getDocs(collection(db, 'video_engagement'))
    ]);

    const users = usersSnapshot.docs.map(doc => doc.data());
    const videoStats = videoStatsSnapshot.docs.map(doc => doc.data());
    const engagements = engagementsSnapshot.docs.map(doc => doc.data());

    // Calculate today's active users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = users.filter(user => {
      const lastActive = user.last_active?.toDate();
      return lastActive && lastActive >= today;
    }).length;

    // Calculate total views across all videos
    const totalViews = videoStats.reduce((sum, video) => sum + (video.total_views || 0), 0);
    
    // Calculate average rating
    const totalApprovals = videoStats.reduce((sum, video) => sum + (video.total_approvals || 0), 0);
    const totalDisapprovals = videoStats.reduce((sum, video) => sum + (video.total_disapprovals || 0), 0);
    const totalVotes = totalApprovals + totalDisapprovals;
    const averageVideoRating = totalVotes > 0 ? (totalApprovals / totalVotes) * 100 : 0;

    return {
      totalUsers: users.length,
      totalVideos: videoStats.length,
      totalViews,
      totalEngagements: engagements.length,
      activeUsersToday,
      averageVideoRating
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalVideos: 0,
      totalViews: 0,
      totalEngagements: 0,
      activeUsersToday: 0,
      averageVideoRating: 0
    };
  }
}

// User Analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const [user, profileDoc, engagements] = await Promise.all([
      getUserById(userId),
      getDoc(doc(db, 'profile', userId)),
      getUserEngagements(userId)
    ]);

    if (!user) return null;

    const profile = profileDoc.exists() ? profileDoc.data() as UserProfile : undefined;

    // Calculate additional analytics
    const totalWatchTime = engagements.reduce((sum, eng) => sum + (eng.view_count || 0), 0);
    
    // Mock favorite categories and development progress (you can enhance this based on your data)
    const favoriteCategories = ['Motor Skills', 'Communication', 'Cognitive Development'];
    const developmentProgress = {
      ageGroup: profile?.child_age_months ? `${Math.floor(profile.child_age_months / 3) * 3}-${Math.floor(profile.child_age_months / 3) * 3 + 3} months` : 'Unknown',
      completedMilestones: engagements.filter(e => e.vote === 'approve').length,
      totalMilestones: engagements.length,
      concerns: engagements.filter(e => e.vote === 'disapprove').map(e => e.video_id)
    };

    return {
      user,
      profile,
      videoEngagements: engagements,
      totalWatchTime,
      favoriteCategories,
      developmentProgress
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}

// Chat/Messaging System
export async function getUserChats(userId: string): Promise<ChatMessage[]> {
  try {
    const chatRef = collection(db, 'chats', userId, 'messages');
    const chatSnapshot = await getDocs(
      query(chatRef, orderBy('timestamp', 'desc'), limit(50))
    );
    
    return chatSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    } as ChatMessage));
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return [];
  }
}

export async function sendMessageToUser(userId: string, message: string, doctorId: string): Promise<boolean> {
  try {
    const chatRef = collection(db, 'chats', userId, 'messages');
    await addDoc(chatRef, {
      user_id: userId,
      doctor_id: doctorId,
      message,
      timestamp: Timestamp.now(),
      sender_type: 'doctor',
      read: false
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

export function subscribeToUserChats(
  userId: string, 
  callback: (messages: ChatMessage[]) => void
) {
  const chatRef = collection(db, 'chats', userId, 'messages');
  return onSnapshot(
    query(chatRef, orderBy('timestamp', 'desc'), limit(50)),
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as ChatMessage));
      callback(messages);
    }
  );
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  try {
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    return notificationsSnapshot.docs.map(doc => ({
      user_name: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}
