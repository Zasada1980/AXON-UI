import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Users,
  Eye,
  PaperPlaneTilt,
  Clock,
  CheckCircle,
  Warning,
  User,
  Share,
  Globe,
  Lock,
  WifiX,
  WifiSlash,
  Cursor,
  ChatCircle,
  VideoCamera,
  Microphone,
  Monitor,
  Plus,
  ArrowRight,
  Star,
  Lightbulb,
  Target,
  Brain
} from '@phosphor-icons/react';

// Remove the duplicate global declaration since it's already defined in the main app

const spark = (globalThis as any).spark;

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  projectId: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  lastActivity: string;
  settings: {
    isPublic: boolean;
    allowAnonymous: boolean;
    maxParticipants: number;
    requireApproval: boolean;
  };
  workspace: CollaborativeWorkspace;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'analyst' | 'reviewer' | 'observer';
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canInvite: boolean;
  };
  cursor?: {
    x: number;
    y: number;
    section: string;
  };
}

interface CollaborativeWorkspace {
  id: string;
  sharedContent: Record<string, any>;
  comments: Comment[];
  annotations: Annotation[];
  realTimeEdits: RealtimeEdit[];
  consensus: ConsensusItem[];
  voting: VotingItem[];
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  location: {
    section: string;
    elementId?: string;
    coordinates?: { x: number; y: number };
  };
  replies: Reply[];
  resolved: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface Reply {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

interface Annotation {
  id: string;
  authorId: string;
  type: 'highlight' | 'note' | 'question' | 'suggestion';
  content: string;
  location: {
    section: string;
    startOffset: number;
    endOffset: number;
    text: string;
  };
  timestamp: string;
}

interface RealtimeEdit {
  id: string;
  authorId: string;
  action: 'insert' | 'delete' | 'update';
  content: any;
  location: string;
  timestamp: string;
  synchronized: boolean;
}

interface ConsensusItem {
  id: string;
  topic: string;
  description: string;
  status: 'pending' | 'voting' | 'consensus' | 'rejected';
  responses: Record<string, 'agree' | 'disagree' | 'abstain'>;
  threshold: number;
  createdAt: string;
  decidedAt?: string;
}

interface VotingItem {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  allowMultiple: boolean;
  anonymous: boolean;
  createdAt: string;
  endsAt: string;
  status: 'open' | 'closed';
}

interface CollaborativeAnalysisProps {
  language: string;
  projectId: string;
  onSessionCreated?: (session: CollaborationSession) => void;
  onParticipantJoined?: (participant: Participant) => void;
  onConsensusReached?: (item: ConsensusItem) => void;
}

const CollaborativeAnalysis: React.FC<CollaborativeAnalysisProps> = ({
  language,
  projectId,
  onSessionCreated,
  onParticipantJoined,
  onConsensusReached
}) => {
  const t = (key: string) => key; // Simplified translation function

  // State management
  const [sessions, setSessions] = useKV<CollaborationSession[]>('collaboration-sessions', []);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionBuilder, setSessionBuilder] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxParticipants: 10
  });
  const [onlineParticipants, setOnlineParticipants] = useState<string[]>([]);
  const [collaborationMode, setCollaborationMode] = useState<'synchronous' | 'asynchronous'>('synchronous');

  // Initialize user information
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await spark.user();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting user information:', error);
      }
    };
    
    initializeUser();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealtimeActivity();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Create a new collaboration session
  const createCollaborationSession = async () => {
    if (!sessionBuilder.name.trim()) {
      toast.error('Session name is required');
      return;
    }

    if (!currentUser) {
      toast.error('User information not available');
      return;
    }

    const newSession: CollaborationSession = {
      id: `collab-${Date.now()}`,
      name: sessionBuilder.name,
      description: sessionBuilder.description,
      projectId: projectId,
      participants: [{
        id: currentUser.id,
        name: currentUser.login,
        email: currentUser.email,
        role: 'owner',
        avatar: currentUser.avatarUrl,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: true,
          canInvite: true
        }
      }],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      settings: {
        isPublic: sessionBuilder.isPublic,
        allowAnonymous: false,
        maxParticipants: sessionBuilder.maxParticipants,
        requireApproval: !sessionBuilder.isPublic
      },
      workspace: {
        id: `workspace-${Date.now()}`,
        sharedContent: {},
        comments: [],
        annotations: [],
        realTimeEdits: [],
        consensus: [],
        voting: []
      }
    };

    setSessions(current => [...(current || []), newSession]);
    setActiveSession(newSession.id);
    setIsCreatingSession(false);
    setSessionBuilder({ name: '', description: '', isPublic: false, maxParticipants: 10 });
    
    toast.success(`Collaboration session "${newSession.name}" created`);
    
    if (onSessionCreated) {
      onSessionCreated(newSession);
    }
  };

  // Join a collaboration session
  const joinSession = async (sessionId: string) => {
    if (!currentUser) {
      toast.error('User information not available');
      return;
    }

    const session = sessions?.find(s => s.id === sessionId);
    if (!session) {
      toast.error('Session not found');
      return;
    }

    // Check if user is already a participant
    const existingParticipant = session.participants.find(p => p.id === currentUser.id);
    if (existingParticipant) {
      setActiveSession(sessionId);
      toast.info(`Rejoined session: ${session.name}`);
      return;
    }

    // Check session limits
    if (session.participants.length >= session.settings.maxParticipants) {
      toast.error('Session is full');
      return;
    }

    const newParticipant: Participant = {
      id: currentUser.id,
      name: currentUser.login,
      email: currentUser.email,
      role: 'analyst',
      avatar: currentUser.avatarUrl,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      permissions: {
        canEdit: true,
        canComment: true,
        canShare: false,
        canInvite: false
      }
    };

    // Update session with new participant
    setSessions(current => 
      (current || []).map(s => 
        s.id === sessionId 
          ? {
              ...s,
              participants: [...s.participants, newParticipant],
              lastActivity: new Date().toISOString()
            }
          : s
      )
    );

    setActiveSession(sessionId);
    toast.success(`Joined session: ${session.name}`);
    
    if (onParticipantJoined) {
      onParticipantJoined(newParticipant);
    }
  };

  // Create a consensus item
  const createConsensusItem = async (sessionId: string, topic: string, description: string) => {
    const consensusItem: ConsensusItem = {
      id: `consensus-${Date.now()}`,
      topic,
      description,
      status: 'pending',
      responses: {},
      threshold: 0.7, // 70% agreement required
      createdAt: new Date().toISOString()
    };

    setSessions(current => 
      (current || []).map(s => 
        s.id === sessionId 
          ? {
              ...s,
              workspace: {
                ...s.workspace,
                consensus: [...s.workspace.consensus, consensusItem]
              },
              lastActivity: new Date().toISOString()
            }
          : s
      )
    );

    toast.success('Consensus item created');
  };

  // Vote on consensus item
  const voteOnConsensus = (sessionId: string, consensusId: string, vote: 'agree' | 'disagree' | 'abstain') => {
    if (!currentUser) return;

    setSessions(current => 
      (current || []).map(s => 
        s.id === sessionId 
          ? {
              ...s,
              workspace: {
                ...s.workspace,
                consensus: s.workspace.consensus.map(c => 
                  c.id === consensusId 
                    ? {
                        ...c,
                        responses: {
                          ...c.responses,
                          [currentUser.id]: vote
                        }
                      }
                    : c
                )
              },
              lastActivity: new Date().toISOString()
            }
          : s
      )
    );

    // Check if consensus reached
    const session = sessions?.find(s => s.id === sessionId);
    const consensusItem = session?.workspace.consensus.find(c => c.id === consensusId);
    
    if (consensusItem && session) {
      const totalVotes = Object.keys(consensusItem.responses).length;
      const agreeVotes = Object.values(consensusItem.responses).filter(v => v === 'agree').length;
      const consensus = agreeVotes / totalVotes;
      
      if (consensus >= consensusItem.threshold && totalVotes >= Math.ceil(session.participants.length * 0.5)) {
        // Consensus reached
        setSessions(current => 
          (current || []).map(s => 
            s.id === sessionId 
              ? {
                  ...s,
                  workspace: {
                    ...s.workspace,
                    consensus: s.workspace.consensus.map(c => 
                      c.id === consensusId 
                        ? { ...c, status: 'consensus', decidedAt: new Date().toISOString() }
                        : c
                    )
                  }
                }
              : s
          )
        );

        toast.success('Consensus reached!');
        
        if (onConsensusReached) {
          onConsensusReached({ ...consensusItem, status: 'consensus' });
        }
      }
    }

    toast.info(`Vote recorded: ${vote}`);
  };

  // Add comment to session
  const addComment = (sessionId: string, content: string, section: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      location: { section },
      replies: [],
      resolved: false,
      priority: 'medium'
    };

    setSessions(current => 
      (current || []).map(s => 
        s.id === sessionId 
          ? {
              ...s,
              workspace: {
                ...s.workspace,
                comments: [...s.workspace.comments, newComment]
              },
              lastActivity: new Date().toISOString()
            }
          : s
      )
    );

    toast.success('Comment added');
  };

  // Simulate real-time activity for demo
  const simulateRealtimeActivity = () => {
    if (!activeSession || !sessions) return;

    const session = sessions.find(s => s.id === activeSession);
    if (!session) return;

    // Simulate cursor movements
    const activeParticipants = session.participants.filter(p => p.isOnline && p.id !== currentUser?.id);
    if (activeParticipants.length > 0) {
      const randomParticipant = activeParticipants[Math.floor(Math.random() * activeParticipants.length)];
      
      setSessions(current => 
        (current || []).map(s => 
          s.id === activeSession 
            ? {
                ...s,
                participants: s.participants.map(p => 
                  p.id === randomParticipant.id 
                    ? {
                        ...p,
                        cursor: {
                          x: Math.random() * 100,
                          y: Math.random() * 100,
                          section: ['overview', 'kipling', 'ikr', 'analysis'][Math.floor(Math.random() * 4)]
                        }
                      }
                    : p
                )
              }
            : s
        )
      );
    }
  };

  // Get session status color
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'completed': return 'text-blue-500';
      case 'archived': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  // Get participant role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'analyst': return 'bg-blue-500';
      case 'reviewer': return 'bg-green-500';
      case 'observer': return 'bg-gray-500';
      default: return 'bg-muted';
    }
  };

  const activeSessionData = sessions?.find(s => s.id === activeSession);

  return (
    <div className="space-y-6">
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Collaborative Analysis
          </CardTitle>
          <CardDescription>
            Real-time collaborative intelligence analysis with multiple participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sessions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="consensus">Consensus</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            {/* Active Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Collaboration Sessions</h3>
                <Button onClick={() => setIsCreatingSession(true)}>
                  <Plus size={16} className="mr-2" />
                  New Session
                </Button>
              </div>

              <div className="grid gap-4">
                {(sessions || []).map(session => (
                  <Card key={session.id} className={`cyber-border ${activeSession === session.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-muted-foreground">{session.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSessionStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          <Badge variant="outline">
                            {session.participants.filter(p => p.isOnline).length}/{session.participants.length} online
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {session.participants.slice(0, 5).map(participant => (
                              <div
                                key={participant.id}
                                className="relative w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground"
                                title={participant.name}
                              >
                                {participant.avatar ? (
                                  <img 
                                    src={participant.avatar} 
                                    alt={participant.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  participant.name.substring(0, 2).toUpperCase()
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background ${
                                  participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                              </div>
                            ))}
                            {session.participants.length > 5 && (
                              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                                +{session.participants.length - 5}
                              </div>
                            )}
                          </div>
                          
                          <Separator orientation="vertical" className="h-4" />
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {session.settings.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                            <span>{session.settings.isPublic ? 'Public' : 'Private'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeSession === session.id ? (
                            <Badge variant="default" className="text-xs">
                              <WifiX size={12} className="mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => joinSession(session.id)}
                            >
                              <Users size={16} className="mr-1" />
                              Join Session
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <Eye size={16} className="mr-1" />
                            View Details
                          </Button>
                          
                          {session.settings.isPublic && (
                            <Button size="sm" variant="outline">
                              <Share size={16} className="mr-1" />
                              Share
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!sessions || sessions.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Users size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No collaboration sessions</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Create your first collaboration session to work with others
                      </p>
                      <Button onClick={() => setIsCreatingSession(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Session
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Session Creation Dialog */}
              {isCreatingSession && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Create Collaboration Session</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="session-name">Session Name</Label>
                      <Input
                        id="session-name"
                        value={sessionBuilder.name}
                        onChange={(e) => setSessionBuilder(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Enter session name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="session-description">Description</Label>
                      <Textarea
                        id="session-description"
                        value={sessionBuilder.description}
                        onChange={(e) => setSessionBuilder(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Describe the collaboration purpose"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="max-participants">Max Participants</Label>
                        <Input
                          id="max-participants"
                          type="number"
                          min="2"
                          max="50"
                          value={sessionBuilder.maxParticipants}
                          onChange={(e) => setSessionBuilder(prev => ({
                            ...prev,
                            maxParticipants: parseInt(e.target.value) || 10
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is-public"
                          checked={sessionBuilder.isPublic}
                          onChange={(e) => setSessionBuilder(prev => ({
                            ...prev,
                            isPublic: e.target.checked
                          }))}
                          className="rounded border border-border"
                        />
                        <Label htmlFor="is-public">Public Session</Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingSession(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createCollaborationSession}>
                        <Plus size={16} className="mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Workspace Tab */}
            <TabsContent value="workspace" className="space-y-4">
              {activeSessionData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Workspace: {activeSessionData.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {activeSessionData.participants.filter(p => p.isOnline).length} online
                      </Badge>
                      <Select value={collaborationMode} onValueChange={(value: 'synchronous' | 'asynchronous') => setCollaborationMode(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="synchronous">Real-time</SelectItem>
                          <SelectItem value="asynchronous">Async</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Online Participants */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Online Participants</h4>
                      <div className="space-y-2">
                        {activeSessionData.participants.filter(p => p.isOnline).map(participant => (
                          <div key={participant.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {participant.avatar ? (
                                  <img 
                                    src={participant.avatar} 
                                    alt={participant.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  participant.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{participant.name}</p>
                                <p className="text-xs text-muted-foreground">{participant.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getRoleColor(participant.role)}`} />
                              {participant.cursor && (
                                <Badge variant="outline" className="text-xs">
                                  {participant.cursor.section}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shared Workspace Tools */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Quick Actions</h4>
                        <div className="grid gap-2">
                          <Button size="sm" variant="outline" className="justify-start">
                            <ChatCircle size={16} className="mr-2" />
                            Start Discussion
                          </Button>
                          <Button size="sm" variant="outline" className="justify-start">
                            <Target size={16} className="mr-2" />
                            Create Consensus
                          </Button>
                          <Button size="sm" variant="outline" className="justify-start">
                            <VideoCamera size={16} className="mr-2" />
                            Video Call
                          </Button>
                          <Button size="sm" variant="outline" className="justify-start">
                            <Monitor size={16} className="mr-2" />
                            Screen Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Recent Activity</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock size={12} />
                              <span>User joined the session</span>
                              <span className="text-muted-foreground">2 min ago</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle size={12} />
                              <span>Consensus reached on analysis approach</span>
                              <span className="text-muted-foreground">5 min ago</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PaperPlaneTilt size={12} />
                              <span>New comment added to Kipling analysis</span>
                              <span className="text-muted-foreground">8 min ago</span>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <WifiSlash size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active session</h3>
                    <p className="text-muted-foreground text-center">
                      Join or create a collaboration session to access the workspace
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Consensus Tab */}
            <TabsContent value="consensus" className="space-y-4">
              {activeSessionData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Consensus Building</h3>
                    <Button 
                      onClick={() => {
                        const topic = prompt('Enter consensus topic:');
                        const description = prompt('Enter description:');
                        if (topic && description) {
                          createConsensusItem(activeSessionData.id, topic, description);
                        }
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      New Consensus
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {activeSessionData.workspace.consensus.map(item => (
                      <Card key={item.id} className="cyber-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{item.topic}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Badge variant={item.status === 'consensus' ? 'default' : 'outline'}>
                              {item.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Progress:</span>
                              <Progress 
                                value={(Object.values(item.responses).filter(v => v === 'agree').length / activeSessionData.participants.length) * 100} 
                                className="h-2 flex-1"
                              />
                              <span className="text-sm">
                                {Object.values(item.responses).filter(v => v === 'agree').length}/{activeSessionData.participants.length}
                              </span>
                            </div>

                            {item.status !== 'consensus' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => voteOnConsensus(activeSessionData.id, item.id, 'agree')}
                                  disabled={!!item.responses[currentUser?.id || '']}
                                >
                                  <CheckCircle size={16} className="mr-1" />
                                  Agree
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => voteOnConsensus(activeSessionData.id, item.id, 'disagree')}
                                  disabled={!!item.responses[currentUser?.id || '']}
                                >
                                  <Warning size={16} className="mr-1" />
                                  Disagree
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => voteOnConsensus(activeSessionData.id, item.id, 'abstain')}
                                  disabled={!!item.responses[currentUser?.id || '']}
                                >
                                  Abstain
                                </Button>
                              </div>
                            )}

                            {item.responses[currentUser?.id || ''] && (
                              <Badge variant="secondary" className="text-xs">
                                Your vote: {item.responses[currentUser?.id || '']}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {activeSessionData.workspace.consensus.length === 0 && (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <Target size={48} className="text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No consensus items</h3>
                          <p className="text-muted-foreground text-center">
                            Create consensus items to build agreement with your team
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Target size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active session</h3>
                    <p className="text-muted-foreground text-center">
                      Join a collaboration session to participate in consensus building
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              {activeSessionData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Comments & Annotations</h3>
                    <Button 
                      onClick={() => {
                        const content = prompt('Enter your comment:');
                        const section = prompt('Which section (overview, kipling, ikr, analysis)?') || 'overview';
                        if (content) {
                          addComment(activeSessionData.id, content, section);
                        }
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Comment
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {activeSessionData.workspace.comments.map(comment => {
                      const author = activeSessionData.participants.find(p => p.id === comment.authorId);
                      return (
                        <Card key={comment.id} className="cyber-border">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {author?.avatar ? (
                                  <img 
                                    src={author.avatar} 
                                    alt={author.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  (author?.name || 'U').substring(0, 2).toUpperCase()
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-sm">{author?.name || 'Unknown'}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {comment.location.section}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                
                                <p className="text-sm">{comment.content}</p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Button size="sm" variant="ghost" className="text-xs">
                                    Reply
                                  </Button>
                                  {!comment.resolved && (
                                    <Button size="sm" variant="ghost" className="text-xs">
                                      <CheckCircle size={12} className="mr-1" />
                                      Resolve
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {activeSessionData.workspace.comments.length === 0 && (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <ChatCircle size={48} className="text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                          <p className="text-muted-foreground text-center">
                            Start the conversation by adding your first comment
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <ChatCircle size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active session</h3>
                    <p className="text-muted-foreground text-center">
                      Join a collaboration session to view and add comments
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeAnalysis;