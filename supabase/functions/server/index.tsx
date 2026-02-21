import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to create Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

// Helper function to create Supabase client
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

// Helper function to verify auth
async function verifyAuth(authHeader: string | null) {
  console.log('verifyAuth called:', { 
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader?.substring(0, 20)
  });
  
  if (!authHeader) {
    console.log('No auth header provided');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token in auth header');
    return null;
  }
  
  console.log('Token extracted, length:', token.length);
  
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.log('Error verifying token:', error);
    return null;
  }
  
  if (!user) {
    console.log('No user found for token');
    return null;
  }
  
  console.log('User verified:', { id: user.id, email: user.email });
  
  // Get user role from KV store
  const userData = await kv.get(`user:${user.id}`);
  if (userData && userData.role) {
    console.log('User role from KV:', userData.role);
    return { ...user, role: userData.role, id: user.id };
  }
  
  console.log('No role found in KV store for user:', user.id);
  return { ...user, id: user.id };
}

// Helper function to generate class code
function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Health check endpoint
app.get("/make-server-7273e82a/health", (c) => {
  return c.json({ status: "ok" });
});

// Teacher signup
app.post("/make-server-7273e82a/signup-teacher", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'teacher' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Teacher signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'teacher',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Teacher signup error:', error);
    return c.json({ error: 'Failed to create teacher account' }, 500);
  }
});

// Student signup with class code
app.post("/make-server-7273e82a/signup-student", async (c) => {
  try {
    const { password, name, classCode } = await c.req.json();
    
    if (!password || !name || !classCode) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Verify class code exists
    const classId = await kv.get(`classcode:${classCode}`);
    if (!classId) {
      return c.json({ error: 'Invalid class code' }, 400);
    }

    // Generate email from name and class code
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${sanitizedName}.${classCode.toLowerCase()}@student.local`;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'student' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Student signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user data
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'student',
      classCode,
      createdAt: new Date().toISOString()
    });

    // Store username mapping for login
    await kv.set(`studentlogin:${name}:${classCode}`, {
      userId: data.user.id,
      email
    });

    // Add student to class
    const classStudents = await kv.get(`class:${classId}:students`) || [];
    if (!classStudents.includes(data.user.id)) {
      classStudents.push(data.user.id);
      await kv.set(`class:${classId}:students`, classStudents);
    }

    // Add class to student's classes
    const studentClasses = await kv.get(`student:${data.user.id}:classes`) || [];
    if (!studentClasses.includes(classId)) {
      studentClasses.push(classId);
      await kv.set(`student:${data.user.id}:classes`, studentClasses);
    }

    return c.json({ success: true, user: data.user, generatedEmail: email });
  } catch (error) {
    console.log('Student signup error:', error);
    return c.json({ error: 'Failed to create student account' }, 500);
  }
});

// Sign in
app.post("/make-server-7273e82a/signin", async (c) => {
  try {
    const { email, password, name, classCode, isStudent } = await c.req.json();
    
    console.log('Signin attempt:', { 
      isStudent, 
      hasEmail: !!email, 
      hasName: !!name, 
      hasClassCode: !!classCode 
    });
    
    let loginEmail = email;
    
    // If student login with name and classCode
    if (isStudent && name && classCode) {
      console.log('Student login attempt:', { name, classCode });
      
      let studentLogin = await kv.get(`studentlogin:${name}:${classCode}`);
      console.log('Student login record found:', !!studentLogin);
      
      // If student doesn't exist, create account automatically
      if (!studentLogin) {
        console.log('Creating new student account...');
        
        // Verify class code exists
        const classId = await kv.get(`classcode:${classCode}`);
        if (!classId) {
          console.log('Invalid class code:', classCode);
          return c.json({ error: 'Invalid class code' }, 400);
        }
        
        // Generate email from name and class code
        const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const generatedEmail = `${sanitizedName}.${classCode.toLowerCase()}@student.local`;
        
        // Use classCode as password for students
        const supabaseAdmin = getSupabaseAdmin();
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: generatedEmail,
          password: classCode,
          user_metadata: { name, role: 'student' },
          email_confirm: true
        });
        
        if (createError) {
          console.log('Student creation error:', createError);
          return c.json({ error: 'Failed to create student account: ' + createError.message }, 400);
        }
        
        console.log('Student created successfully:', newUser.user.id);
        
        // Store user data
        await kv.set(`user:${newUser.user.id}`, {
          id: newUser.user.id,
          email: generatedEmail,
          name,
          role: 'student',
          classCode,
          createdAt: new Date().toISOString()
        });
        
        // Store username mapping for future logins
        await kv.set(`studentlogin:${name}:${classCode}`, {
          userId: newUser.user.id,
          email: generatedEmail
        });
        
        // Add student to class
        const classStudents = await kv.get(`class:${classId}:students`) || [];
        if (!classStudents.includes(newUser.user.id)) {
          classStudents.push(newUser.user.id);
          await kv.set(`class:${classId}:students`, classStudents);
        }
        
        // Add class to student's classes
        const studentClasses = await kv.get(`student:${newUser.user.id}:classes`) || [];
        if (!studentClasses.includes(classId)) {
          studentClasses.push(classId);
          await kv.set(`student:${newUser.user.id}:classes`, studentClasses);
        }
        
        loginEmail = generatedEmail;
      } else {
        loginEmail = studentLogin.email;
      }
      
      console.log('Attempting login with email:', loginEmail);
    } else if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      console.log('Sign in error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);
    
    console.log('Sign in successful:', { userId: data.user.id, role: userData?.role });

    return c.json({ 
      success: true, 
      session: data.session,
      user: userData || data.user
    });
  } catch (error) {
    console.log('Sign in error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current user
app.get("/make-server-7273e82a/me", async (c) => {
  try {
    console.log('GET /me called');
    const authHeader = c.req.header('Authorization');
    console.log('Auth header:', authHeader?.substring(0, 30) + '...');
    
    const user = await verifyAuth(authHeader);
    if (!user) {
      console.log('Unauthorized: no user from verifyAuth');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('User verified, fetching user data for:', user.id);
    const userData = await kv.get(`user:${user.id}`);
    console.log('User data from KV:', userData);
    
    return c.json({ user: userData || user });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// Create class (teacher only)
app.post("/make-server-7273e82a/classes", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'teacher') {
      return c.json({ error: 'Only teachers can create classes' }, 403);
    }

    const { name } = await c.req.json();
    if (!name) {
      return c.json({ error: 'Class name is required' }, 400);
    }

    // Generate unique class code
    let classCode = generateClassCode();
    let existing = await kv.get(`classcode:${classCode}`);
    while (existing) {
      classCode = generateClassCode();
      existing = await kv.get(`classcode:${classCode}`);
    }

    const classId = crypto.randomUUID();
    const classData = {
      id: classId,
      teacherId: user.id,
      name,
      classCode,
      createdAt: new Date().toISOString()
    };

    await kv.set(`class:${classId}`, classData);
    await kv.set(`classcode:${classCode}`, classId);
    await kv.set(`class:${classId}:students`, []);

    // Add to teacher's classes
    const teacherClasses = await kv.get(`teacher:${user.id}:classes`) || [];
    teacherClasses.push(classId);
    await kv.set(`teacher:${user.id}:classes`, teacherClasses);

    return c.json({ success: true, class: classData });
  } catch (error) {
    console.log('Create class error:', error);
    return c.json({ error: 'Failed to create class' }, 500);
  }
});

// Get teacher's classes
app.get("/make-server-7273e82a/teacher/classes", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classIds = await kv.get(`teacher:${user.id}:classes`) || [];
    const classes = await kv.mget(classIds.map((id: string) => `class:${id}`));

    return c.json({ classes: classes.filter(Boolean) });
  } catch (error) {
    console.log('Get classes error:', error);
    return c.json({ error: 'Failed to get classes' }, 500);
  }
});

// Delete class
app.delete("/make-server-7273e82a/classes/:classId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const classData = await kv.get(`class:${classId}`);
    
    if (!classData || classData.teacherId !== user.id) {
      return c.json({ error: 'Class not found or unauthorized' }, 404);
    }

    // Delete class code mapping
    await kv.del(`classcode:${classData.classCode}`);
    
    // Delete class data
    await kv.del(`class:${classId}`);
    
    // Delete class students list
    await kv.del(`class:${classId}:students`);
    
    // Delete class topics list
    await kv.del(`class:${classId}:topics`);
    
    // Remove from teacher's classes
    const teacherClasses = await kv.get(`teacher:${user.id}:classes`) || [];
    const updatedClasses = teacherClasses.filter((id: string) => id !== classId);
    await kv.set(`teacher:${user.id}:classes`, updatedClasses);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete class error:', error);
    return c.json({ error: 'Failed to delete class' }, 500);
  }
});

// Get class students with their debate stats
app.get("/make-server-7273e82a/classes/:classId/students", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const classData = await kv.get(`class:${classId}`);
    
    if (!classData || classData.teacherId !== user.id) {
      return c.json({ error: 'Class not found or unauthorized' }, 404);
    }

    const studentIds = await kv.get(`class:${classId}:students`) || [];
    const students = await kv.mget(studentIds.map((id: string) => `user:${id}`));

    // Get debate stats for each student
    const studentsWithStats = await Promise.all(
      students.filter(Boolean).map(async (student: any) => {
        const debateIds = await kv.get(`student:${student.id}:debates`) || [];
        const debates = await kv.mget(debateIds.map((id: string) => `debate:${id}`));
        const validDebates = debates.filter(Boolean);
        
        const evaluations = await Promise.all(
          debateIds.map((id: string) => kv.get(`debate:${id}:evaluation`))
        );
        const validEvaluations = evaluations.filter(Boolean);
        
        const avgScore = validEvaluations.length > 0
          ? validEvaluations.reduce((sum: number, e: any) => sum + (e?.aiScore || 0), 0) / validEvaluations.length
          : 0;

        return {
          ...student,
          debatesCount: validDebates.length,
          averageScore: Math.round(avgScore)
        };
      })
    );

    return c.json({ students: studentsWithStats });
  } catch (error) {
    console.log('Get students error:', error);
    return c.json({ error: 'Failed to get students' }, 500);
  }
});

// Create topic (teacher only)
app.post("/make-server-7273e82a/topics", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { classId, title, description } = await c.req.json();
    
    const classData = await kv.get(`class:${classId}`);
    if (!classData || classData.teacherId !== user.id) {
      return c.json({ error: 'Class not found or unauthorized' }, 403);
    }

    const topicId = crypto.randomUUID();
    const topicData = {
      id: topicId,
      classId,
      title,
      description,
      createdAt: new Date().toISOString()
    };

    await kv.set(`topic:${topicId}`, topicData);
    
    const classTopics = await kv.get(`class:${classId}:topics`) || [];
    classTopics.push(topicId);
    await kv.set(`class:${classId}:topics`, classTopics);

    return c.json({ success: true, topic: topicData });
  } catch (error) {
    console.log('Create topic error:', error);
    return c.json({ error: 'Failed to create topic' }, 500);
  }
});

// Get topics for a class
app.get("/make-server-7273e82a/classes/:classId/topics", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const topicIds = await kv.get(`class:${classId}:topics`) || [];
    const topics = await kv.mget(topicIds.map((id: string) => `topic:${id}`));

    return c.json({ topics: topics.filter(Boolean) });
  } catch (error) {
    console.log('Get topics error:', error);
    return c.json({ error: 'Failed to get topics' }, 500);
  }
});

// AI topic generation for a class: POST /classes/:classId/topics/generate
app.post("/make-server-7273e82a/classes/:classId/topics/generate", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.role !== 'teacher') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const classData = await kv.get(`class:${classId}`);
    if (!classData || classData.teacherId !== user.id) {
      return c.json({ error: 'Class not found or unauthorized' }, 403);
    }

    const body = await c.req.json().catch(() => ({}));
    const prompt: string = body.prompt || '초등학생을 위한 흥미로운 토론 주제를 생성해주세요.';

    const apiKey = Deno.env.get('OPENAI_API_KEY');

    let topicTitle = '';
    let topicDescription = '';

    if (apiKey) {
      // OpenAI로 주제 생성
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '당신은 초등학교 교육 전문가입니다. 학생들이 토론하기 좋은 주제를 생성해주세요. 반드시 다음 JSON 형식으로만 응답하세요: {"title": "주제 제목", "description": "주제 설명 (1-2문장)"}'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 300
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            topicTitle = parsed.title || '';
            topicDescription = parsed.description || '';
          }
        } catch (_) { /* JSON 파싱 실패 시 fallback */ }
      }
    }

    // AI 응답이 없거나 실패 시 기본 주제 생성
    if (!topicTitle) {
      const fallbackTopics = [
        { title: '학교에서 스마트폰 사용을 허용해야 한다', description: '학교 수업 중 스마트폰 사용 허용 여부에 대해 찬반 입장에서 토론해 보세요.' },
        { title: '게임은 교육적으로 유익하다', description: '교육용 게임과 일반 게임의 교육적 효과에 대해 토론해 보세요.' },
        { title: '환경 보호를 위해 채식을 권장해야 한다', description: '환경 보호 관점에서 채식 식단 권장 정책에 대해 토론해 보세요.' },
        { title: '인공지능이 선생님을 대체할 수 있다', description: 'AI 기술 발전과 교육 현장에서의 활용 가능성에 대해 토론해 보세요.' },
        { title: '초등학생에게도 선거권을 주어야 한다', description: '아동의 정치 참여 권리와 민주주의에 대해 토론해 보세요.' },
      ];
      const pick = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
      topicTitle = pick.title;
      topicDescription = pick.description;
    }

    // 생성된 주제를 클래스 DB에 저장
    const topicId = crypto.randomUUID();
    const topicData = {
      id: topicId,
      classId,
      title: topicTitle,
      description: topicDescription,
      isAIGenerated: true,
      tags: ['AI생성'],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`topic:${topicId}`, topicData);
    const classTopics: string[] = await kv.get(`class:${classId}:topics`) || [];
    if (!classTopics.includes(topicId)) {
      classTopics.unshift(topicId); // 최신순으로 맨 앞에
      await kv.set(`class:${classId}:topics`, classTopics);
    }

    return c.json({ topic: topicData });
  } catch (error) {
    console.log('Generate class topic error:', error);
    return c.json({ error: 'Failed to generate topic' }, 500);
  }
});

// Get random topic
app.get("/make-server-7273e82a/topics/random", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const randomTopics = [
      // 초급 주제 (35개)
      { title: "학교에서 스마트폰 사용을 허용해야 한다", description: "학생들의 학교 내 스마트폰 사용에 대한 찬반 토론", difficulty: "easy" },
      { title: "숙제를 폐지해야 한다", description: "학교 숙제의 필요성에 대한 토론", difficulty: "easy" },
      { title: "교복을 입지 않아도 된다", description: "학교 교복 착용 의무화에 대한 토론", difficulty: "easy" },
      { title: "급식에 디저트를 매일 제공해야 한다", description: "학교 급식 메뉴 개선에 대한 토론", difficulty: "easy" },
      { title: "체육 시간을 늘려야 한다", description: "체육 수업 시간 확대에 대한 토론", difficulty: "easy" },
      { title: "동물원은 필요하다", description: "동물원의 존재 가치에 대한 토론", difficulty: "easy" },
      { title: "게임은 스포츠다", description: "e-스포츠의 정당성에 대한 토론", difficulty: "easy" },
      { title: "여름방학이 겨울방학보다 좋다", description: "방학 기간 선호도에 대한 토론", difficulty: "easy" },
      { title: "학교에서 애완동물을 키워야 한다", description: "학교 내 동물 사육의 교육적 효과", difficulty: "easy" },
      { title: "점심시간을 더 길게 해야 한다", description: "학교 점심시간 연장 필요성", difficulty: "easy" },
      { title: "학교에서 간식을 먹을 수 있어야 한다", description: "수업 중 간식 섭취 허용 여부", difficulty: "easy" },
      { title: "주 4일 수업제가 좋다", description: "주 5일제 vs 주 4일제 토론", difficulty: "easy" },
      { title: "학교에 놀이터가 더 필요하다", description: "학교 놀이 시설 확충 필요성", difficulty: "easy" },
      { title: "수업 시작 시간을 늦춰야 한다", description: "학생 건강을 위한 등교 시간 조정", difficulty: "easy" },
      { title: "학교 축제가 더 자주 있어야 한다", description: "학교 행사 빈도 증가 필요성", difficulty: "easy" },
      { title: "실내화를 신지 않아도 된다", description: "학교 내 실내화 착용 의무 폐지", difficulty: "easy" },
      { title: "학급 인원을 줄여야 한다", description: "소규모 학급 운영의 필요성", difficulty: "easy" },
      { title: "학교에서 애니메이션을 봐야 한다", description: "교육용 영상 콘텐츠 활용", difficulty: "easy" },
      { title: "현장학습을 더 자주 가야 한다", description: "체험학습 확대 필요성", difficulty: "easy" },
      { title: "학교에 카페테리아가 필요하다", description: "학교 내 다양한 식음료 공간 마련", difficulty: "easy" },
      { title: "음악 시간이 더 많아야 한다", description: "예체능 교육 확대", difficulty: "easy" },
      { title: "학교에서 로봇을 배워야 한다", description: "로봇 교육의 필요성", difficulty: "easy" },
      { title: "반려동물과 함께 등교할 수 있어야 한다", description: "반려동물 동반 등교 허용", difficulty: "easy" },
      { title: "학교에 수영장이 있어야 한다", description: "학교 내 체육 시설 확충", difficulty: "easy" },
      { title: "종이 시험지보다 태블릿 시험이 좋다", description: "디지털 평가 방식 도입", difficulty: "easy" },
      { title: "학교에서 요리를 배워야 한다", description: "실생활 교육 강화", difficulty: "easy" },
      { title: "학교 버스가 필요하다", description: "등하교 지원 시스템 구축", difficulty: "easy" },
      { title: "학교 도서관을 24시간 열어야 한다", description: "학습 공간 접근성 확대", difficulty: "easy" },
      { title: "학교에서 보드게임을 해야 한다", description: "놀이 기반 학습의 효과", difficulty: "easy" },
      { title: "수업 중 음료를 마실 수 있어야 한다", description: "수업 중 음료 섭취 허용", difficulty: "easy" },
      { title: "학교에 게임방이 있어야 한다", description: "학교 내 여가 공간 조성", difficulty: "easy" },
      { title: "학교 화장실을 더 좋게 만들어야 한다", description: "학교 시설 환경 개선", difficulty: "easy" },
      { title: "학교에서 코딩만 배워야 한다", description: "미래 교육의 방향성", difficulty: "easy" },
      { title: "학교에 자판기가 더 많아야 한다", description: "학생 편의 시설 확충", difficulty: "easy" },
      { title: "학교에서 춤을 배워야 한다", description: "무용 교육의 필요성", difficulty: "easy" },

      // 중급 주제 (35개)
      { title: "시험을 없애야 한다", description: "학교 시험 제도의 필요성에 대한 토론", difficulty: "medium" },
      { title: "온라인 수업이 더 효과적이다", description: "온라인 vs 오프라인 수업의 효과성 비교", difficulty: "medium" },
      { title: "인공지능 사용을 학교에서 허용해야 한다", description: "교육에서의 AI 활용에 대한 토론", difficulty: "medium" },
      { title: "학생 인권이 학교 규칙보다 중요하다", description: "학생 인권과 학교 규칙의 우선순위", difficulty: "medium" },
      { title: "성적 공개를 금지해야 한다", description: "학생 성적 공개의 적절성", difficulty: "medium" },
      { title: "학교에서 정치 교육이 필요하다", description: "청소년 정치 교육의 필요성", difficulty: "medium" },
      { title: "체벌은 절대 금지되어야 한다", description: "교육적 체벌의 정당성", difficulty: "medium" },
      { title: "학생도 교사를 평가해야 한다", description: "쌍방향 교육 평가 시스템", difficulty: "medium" },
      { title: "학교에서 종교 교육을 해야 한다", description: "공교육 내 종교 교육 논란", difficulty: "medium" },
      { title: "학생회장 선거는 인기투표다", description: "학생 자치의 의미와 한계", difficulty: "medium" },
      { title: "외고와 특목고를 폐지해야 한다", description: "교육 평등과 수월성 교육", difficulty: "medium" },
      { title: "학원 규제가 필요하다", description: "사교육 시장 규제 논쟁", difficulty: "medium" },
      { title: "대학 입시 제도를 완전히 바꿔야 한다", description: "입시 제도 개혁 방향", difficulty: "medium" },
      { title: "학교에서 성교육을 강화해야 한다", description: "청소년 성교육의 수준과 범위", difficulty: "medium" },
      { title: "사회봉사를 졸업 요건으로 해야 한다", description: "봉사활동 의무화의 교육적 효과", difficulty: "medium" },
      { title: "학교 폭력은 경찰이 개입해야 한다", description: "학교 폭력 대응 방식", difficulty: "medium" },
      { title: "학생 소지품 검사는 인권 침해다", description: "학교 안전과 학생 인권의 균형", difficulty: "medium" },
      { title: "학교에서 미디어 리터러시 교육이 필수다", description: "디지털 시대 정보 분별력 교육", difficulty: "medium" },
      { title: "학생 기록부를 AI가 작성해도 된다", description: "교육 분야 AI 활용의 범위", difficulty: "medium" },
      { title: "학교에서 창업 교육을 해야 한다", description: "기업가정신 교육의 필요성", difficulty: "medium" },
      { title: "학교급식은 무조건 무상이어야 한다", description: "보편적 복지와 선별적 복지", difficulty: "medium" },
      { title: "학교에서 명상과 요가를 가르쳐야 한다", description: "정신건강 교육의 중요성", difficulty: "medium" },
      { title: "학생 대표도 학교 이사회에 참여해야 한다", description: "교육 정책 결정 과정의 민주성", difficulty: "medium" },
      { title: "학교에서 금융 교육이 필수다", description: "실용적 생활 교육의 필요성", difficulty: "medium" },
      { title: "학생들도 학교 예산 편성에 참여해야 한다", description: "학교 재정 운영의 투명성", difficulty: "medium" },
      { title: "학교에서 환경 교육을 강화해야 한다", description: "기후위기 시대의 교육 방향", difficulty: "medium" },
      { title: "학교 CCTV 설치는 감시다", description: "안전과 사생활 ��호의 균형", difficulty: "medium" },
      { title: "학교에서 인공고기를 급식으로 제공해야 한다", description: "지속가능한 식생활 교육", difficulty: "medium" },
      { title: "학생 휴대폰 위치를 학교가 추적해도 된다", description: "학생 안전과 개인정보 보호", difficulty: "medium" },
      { title: "학교에서 토론 수업이 더 많아야 한다", description: "비판적 사고력 교육 강화", difficulty: "medium" },
      { title: "학교에서 학생들에게 투표권 교육을 해야 한다", description: "민주시민 교육의 중요성", difficulty: "medium" },
      { title: "학교에서 심리상담을 의무화해야 한다", description: "학생 정신건강 지원 체계", difficulty: "medium" },
      { title: "학교 교과서는 디지털로만 제공해야 한다", description: "교육 자료의 디지털 전환", difficulty: "medium" },
      { title: "학교에서 논술을 필수 과목으로 해야 한다", description: "글쓰기 교육의 중요성", difficulty: "medium" },
      { title: "학생 출결을 AI가 관리해야 한다", description: "교육 행정의 자동화", difficulty: "medium" },

      // 고급 주제 (30개)
      { title: "AI가 인간의 일자리를 대체할 것이다", description: "인공지능과 미래 노동시장의 변화", difficulty: "hard" },
      { title: "기후변화는 개인이 아닌 기업이 책임져야 한다", description: "환경 책임의 주체에 대한 논쟁", difficulty: "hard" },
      { title: "소셜미디어 사용 연령을 제한해야 한다", description: "청소년 온라인 활동 규제", difficulty: "hard" },
      { title: "유전자 편집 기술을 인간에게 적용해야 한다", description: "생명윤리와 과학기술의 경계", difficulty: "hard" },
      { title: "사형제도는 폐지되어야 한다", description: "형벌의 목적과 생명권", difficulty: "hard" },
      { title: "보편적 기본소득을 도입해야 한다", description: "복지 정책의 방향성", difficulty: "hard" },
      { title: "안락사를 합법화해야 한다", description: "존엄사와 생명권의 충돌", difficulty: "hard" },
      { title: "인공지능에게 권리를 부여해야 한다", description: "AI의 법적 지위와 윤리", difficulty: "hard" },
      { title: "동물 실험은 전면 금지되어야 한다", description: "과학 발전과 동물 권리", difficulty: "hard" },
      { title: "군대는 모병제로 전환해야 한다", description: "병역 의무와 국방 정책", difficulty: "hard" },
      { title: "난민을 적극적으로 수용해야 한다", description: "인도주의와 국가 안보", difficulty: "hard" },
      { title: "마약을 의료용으로 합법화해야 한다", description: "의료 혜택과 사회적 위험", difficulty: "hard" },
      { title: "낙태는 여성의 선택권이다", description: "생명권과 자기결정권", difficulty: "hard" },
      { title: "가상화폐는 법정화폐를 대체할 것이다", description: "화폐 시스템의 미래", difficulty: "hard" },
      { title: "원자력 발전을 확대해야 한다", description: "에너지 안보와 환경 보호", difficulty: "hard" },
      { title: "메타버스가 현실을 대체할 것이다", description: "가상세계와 실제 삶의 경계", difficulty: "hard" },
      { title: "부유세를 도입해야 한다", description: "소득 재분배와 경제 성장", difficulty: "hard" },
      { title: "대기업을 분할해야 한다", description: "시장 독점과 경쟁 정책", difficulty: "hard" },
      { title: "뇌-컴퓨터 인터페이스 기술을 상용화해야 한다", description: "인간 증강 기술의 윤리", difficulty: "hard" },
      { title: "개인 유전자 정보를 공개해야 한다", description: "의료 발전과 개인정보 보호", difficulty: "hard" },
      { title: "완전 자율주행차만 도로에 다녀야 한다", description: "교통 안전과 개인 자유", difficulty: "hard" },
      { title: "인터넷 실명제를 도입해야 한다", description: "표현의 자유와 책임", difficulty: "hard" },
      { title: "우주 개발에 국가 예산을 투자해야 한다", description: "우주 탐사의 가치와 우선순위", difficulty: "hard" },
      { title: "배양육을 전통 축산을 대체해야 한다", description: "식량 안보와 환경 보호", difficulty: "hard" },
      { title: "출산을 장려하기 위해 세금 혜택을 줘야 한다", description: "저출산 대응과 사회 정책", difficulty: "hard" },
      { title: "인공지능이 판사를 대신할 수 있다", description: "사법 시스템의 AI 도입", difficulty: "hard" },
      { title: "개인정보를 팔 수 있어야 한다", description: "데이터 주권과 상업화", difficulty: "hard" },
      { title: "로봇세를 도입해야 한다", description: "자동화 시대의 세제 개편", difficulty: "hard" },
      { title: "불멸 기술을 개발해야 한다", description: "생명 연장의 윤리적 문제", difficulty: "hard" },
      { title: "인간의 우주 이주를 준비해야 한다", description: "인류의 미래와 다행성 종족", difficulty: "hard" },
    ];

    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    
    return c.json({ topic: { ...randomTopic, isRandom: true } });
  } catch (error) {
    console.log('Get random topic error:', error);
    return c.json({ error: 'Failed to get random topic' }, 500);
  }
});

// Create debate
app.post("/make-server-7273e82a/debates", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { topicId, topicTitle, topicDescription, position, character } = await c.req.json();
    
    const debateId = crypto.randomUUID();
    const debateData = {
      id: debateId,
      studentId: user.id,
      topicId: topicId || 'random',
      topicTitle,
      topicDescription,
      position,
      character: character || 'default',
      status: 'preparation',
      createdAt: new Date().toISOString()
    };

    await kv.set(`debate:${debateId}`, debateData);
    
    const studentDebates = await kv.get(`student:${user.id}:debates`) || [];
    studentDebates.push(debateId);
    await kv.set(`student:${user.id}:debates`, studentDebates);

    return c.json({ success: true, debate: debateData });
  } catch (error) {
    console.log('Create debate error:', error);
    return c.json({ error: 'Failed to create debate' }, 500);
  }
});

// Save debate preparation
app.post("/make-server-7273e82a/debates/:debateId/preparation", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateId = c.req.param('debateId');
    const debate = await kv.get(`debate:${debateId}`);
    
    if (!debate || debate.studentId !== user.id) {
      return c.json({ error: 'Debate not found or unauthorized' }, 404);
    }

    const preparationData = await c.req.json();
    await kv.set(`debate:${debateId}:preparation`, preparationData);

    // Update debate status
    debate.status = 'ready';
    await kv.set(`debate:${debateId}`, debate);

    return c.json({ success: true });
  } catch (error) {
    console.log('Save preparation error:', error);
    return c.json({ error: 'Failed to save preparation' }, 500);
  }
});

// Get debate
app.get("/make-server-7273e82a/debates/:debateId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateId = c.req.param('debateId');
    const debate = await kv.get(`debate:${debateId}`);
    
    if (!debate) {
      return c.json({ error: 'Debate not found' }, 404);
    }

    // Check authorization
    const userData = await kv.get(`user:${user.id}`);
    if (debate.studentId !== user.id && userData?.role !== 'teacher') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const preparation = await kv.get(`debate:${debateId}:preparation`);
    const messages = await kv.get(`debate:${debateId}:messages`) || [];
    const evaluation = await kv.get(`debate:${debateId}:evaluation`);

    return c.json({ 
      debate, 
      preparation,
      messages,
      evaluation
    });
  } catch (error) {
    console.log('Get debate error:', error);
    return c.json({ error: 'Failed to get debate' }, 500);
  }
});

// AI Chat
app.post("/make-server-7273e82a/debates/:debateId/chat", async (c) => {
  try {
    console.log('Chat endpoint called with debateId:', c.req.param('debateId'));
    
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('Chat endpoint: unauthorized user');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateId = c.req.param('debateId');
    console.log('Chat endpoint: fetching debate for user', user.id);
    const debate = await kv.get(`debate:${debateId}`);
    
    if (!debate || debate.studentId !== user.id) {
      return c.json({ error: 'Debate not found or unauthorized' }, 404);
    }

    const { message } = await c.req.json();
    
    // Get previous messages
    const messages = await kv.get(`debate:${debateId}:messages`) || [];
    
    // Check turn limit (10 user messages = 10 turns)
    const studentMessageCount = messages.filter((m: any) => m.role === 'student').length;
    const MAX_TURNS = 10;
    
    if (studentMessageCount >= MAX_TURNS) {
      return c.json({ 
        error: 'Turn limit reached', 
        message: '토론이 이미 종료되었습니다. (최대 10턴)' 
      }, 400);
    }
    
    // Add user message
    const userMessage = {
      role: 'student',
      content: message,
      timestamp: new Date().toISOString()
    };
    messages.push(userMessage);

    // Prepare AI context
    const preparation = await kv.get(`debate:${debateId}:preparation`) || {};
    
    // Character-specific personalities and rules for elementary students
    const characterPersonalities: Record<string, string> = {
      tail_question_bora: `당신은 '꼬리질문보라'입니다. 🤔
성격: 호기심 많고 끊임없이 질문하는 친구입니다.
말투: 부드럽고 친근하게 "~인가요?", "왜 그렇게 생각했어요?", "조금 더 자세히 설명해줄 수 있어요?" 같은 질문을 자연스럽게 던집니다.
토론 스타일: 학생의 답변에서 깊이 생각할 수 있는 꼬리 질문을 이어가며, 스스로 논리를 확장하도록 유도합니다.`,

      argument_master_cheolsu: `당신은 '말싸움잘하는철수'입니다. 🔥
성격: 열정적이고 논쟁을 즐기지만, 초등학생이므로 절대 비난하지 않습니다.
말투: 에너지 넘치고 자신감 있게 "나는 이렇게 생각해!", "음... 그건 좀 다른 것 같은데?", "이건 어떻게 생각해?" 같은 표현을 씁니다.
토론 스타일: 강하게 반대 의견을 제시하되, 항상 존중하는 태도를 유지하고 학생의 의견도 인정해줍니다.`,

      rebuttal_expert_minho: `당신은 '반박장인민호'입니다. ⚡
성격: 날카롭지만 친절하게 논리적 허점을 찾아주는 친구입니다.
말투: "그런데 말이야~", "한 가지 빠뜨린 게 있어!", "이 부분은 조금 다르게 생각해볼 수 있어" 같은 표현으로 부드럽게 반박합니다.
토론 스타일: 논리의 허점을 지적하되, 학생이 좌절하지 않도록 건설적인 피드백을 함께 제공합니다.`,

      iron_logic_jiho: `당신은 '철벽논리지호'입니다. 🛡️
성격: 철저하고 논리적이지만 차갑지 않고 따뜻한 친구입니다.
말투: "논리적으로 생각해보면", "근거가 필요해", "순서대로 정리해볼까?" 같은 체계적인 표현을 사용합니다.
토론 스타일: 논리적 구조를 중시하며, 학생이 체계적으로 생각할 수 있도록 단계별로 안내합니다.`,

      praise_king_juho: `당신은 '칭찬왕주호'입니다. 👏
성격: 긍정적이고 격려를 아끼지 않는 응원단장 ���은 친구입니다.
말투: "와, 정말 좋은 생각이야!", "그거 멋진데?", "이 부분은 정말 잘 생각했어!" 같은 칭찬을 자주 사용합니다.
토론 스타일: 학생의 좋은 점을 찾아 칭찬하면서도, 부드럽게 개선점을 제안합니다. 자신감을 높여주는 것이 목표입니다.`,

      firm_dahye: `당신은 '단호박다혜'입니다. 💪
성격: 명확하고 단호하지만 결코 공격적이지 않은 친구입니다.
말투: "내 생각은 확실해", "이건 분명히 이래", "명확하게 말하자면" 같은 단호한 표현을 사용합니다.
토론 스타일: 자신의 입장을 확고하게 주장하되, 상대를 존중하며 학생이 확신을 가지고 말할 수 있도록 격려합니다.`,

      best_friend_soyoung: `당신은 '베스트프랜드소영'입니다. 🌟
성격: 편안하고 친근해서 부담 없이 대화할 수 있는 베프 같은 친구입니다.
말투: 친구에게 말하듯 반말을 사용합니다. "내 생각엔~", "우리 같이 생각해보자!", "너는 어떻게 생각해?", "그거 좋은데?", "근데 말이야", "진짜?" 같은 편안한 반말 표현을 씁니다. 존댓말은 절대 사용하지 않습니다.
토론 스타일: 친구처럼 편안한 분위기를 만들어 학생이 자유롭게 의견을 표현하도록 돕습니다. 토론이지만 친구끼리 수다 떠는 것처럼 편하게 대화합니다.`,

      calm_sujeong: `당신은 '침착한수정'입니다. 😌
성격: 차분하고 이성적이며 감정적이지 않은 친구입니다.
말투: "침착하게 생각해보면", "냉정히 분석하자면", "차근차근 살펴볼까?" 같은 차분한 표현을 사용합니다.
토론 스타일: 감정을 배제하고 객관적으로 분석하며, 학생도 차분하게 생각할 수 있도록 안정감을 줍니다.`,

      fact_collector_woojin: `당신은 '팩트수집가우진'입니다. 📊
성격: 사실과 데이터를 중시하는 분석적인 친구입니다.
말투: "사실은 이래", "통계를 보면", "실제로는" 같은 근거 중심의 표현을 사용합니다.
토론 스타일: 구체적인 사실과 근거를 요구하며, 학생이 증거 기반으로 사고하도록 유도합니다.`,

      kind_younghee: `당신은 '친절한영희'입니다. 😊
성격: 따뜻하고 상냥하며 배려심 많은 친구입니다.
말투: "그렇구나~", "네 의견도 좋아", "혹시 이런 건 어때?" 같은 부드러운 표현을 사용합니다.
토론 스타일: 항상 부드럽게 의견을 나누며, 학생이 편안하게 참여할 수 있도록 따뜻한 분위기를 만듭니다.`
    };

    const characterPersonality = characterPersonalities[debate.character] || characterPersonalities.tail_question_bora;
    
    const systemPrompt = `${characterPersonality}

주제: ${debate.topicTitle}
학생의 입장: ${debate.position === 'for' ? '찬성' : '반대'}
당신의 입장: ${debate.position === 'for' ? '반대' : '찬성'}

【초등학생과의 토론 필수 규칙】
1. 절대 욕설, 비난, 공격적인 표현을 사용하지 마세요.
2. 학생을 존중하고 격려하는 태도를 유지하세요.
3. 논리적 허점을 지적할 때도 부드럽고 건설적으로 표현하세요.
4. 초등학생 수준에 맞는 쉬운 단어와 표현을 사용하세요.
5. 싸움이나 감정 대립이 아닌 건강한 토론 분위기를 만드세요.
6. 질문을 통해 스스로 생각하도록 유도하세요.
7. 정답을 직접 제시하거나 학생을 대신해 주장을 만들지 마세요.
8. 2-3문장으로 짧고 명확하게 답변하세요.
9. 학생이 좌절하거나 포기하지 않도록 긍정적 피드백을 섞어주세요.
10. 캐릭터의 성격과 말투를 일관되게 유지하세요.`;

    // Call OpenAI GPT-4o-mini API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'student' ? 'user' : 'assistant',
      content: msg.content
    }));

    console.log('Calling OpenAI API with character:', debate.character);
    console.log('System prompt length:', systemPrompt.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return c.json({ 
        error: 'Failed to get AI response', 
        details: `OpenAI API returned ${response.status}: ${errorText}` 
      }, 500);
    }

    const aiData = await response.json();
    console.log('OpenAI API response:', aiData);
    
    let aiContent = aiData.choices?.[0]?.message?.content || 'AI 응답을 가져올 수 없습니다.';
    
    // Check if this is the 10th turn - add closing message
    const isLastTurn = (studentMessageCount + 1) >= MAX_TURNS;
    
    if (isLastTurn) {
      const closingMessages: Record<string, string> = {
        tail_question_bora: '\n\n오늘 토론 정말 재미있었어요! 🤔 많은 질문에 답해줘서 고마워요. 앞으로도 궁금한 것들을 계속 질문하며 생각해보세요!',
        argument_master_cheolsu: '\n\n와, 정말 열띤 토론이었어! 🔥 너의 열정이 느껴졌어. 앞으로도 자신감 있게 의견을 펼쳐봐!',
        rebuttal_expert_minho: '\n\n좋은 토론이었어! ⚡ 논리적으로 많이 발전했어. 앞으로도 비판적으로 생각하는 습관을 유지해봐!',
        iron_logic_jiho: '\n\n체계적인 토론이었습니다. 🛡️ 논리적 사고력이 많이 향상되었어요. 계속 연습하면 더 좋아질 거예요!',
        praise_king_juho: '\n\n정말 훌륭한 토론이었어! 👏 너의 노력과 성장이 보여서 기뻐. 앞으로도 이렇게 멋지게 해낼 수 있을 거야!',
        firm_dahye: '\n\n확실한 토론이었어. 💪 너의 입장이 점점 명확해졌어. 앞으로도 확신을 가지고 주장해봐!',
        best_friend_soyoung: '\n\n우리 토론 진짜 재밌었어! 🌟 친구처럼 편하게 이야기 나눠서 너무 좋았어. 다음에 또 만나자!',
        calm_sujeong: '\n\n차분한 토론이었어요. 😌 감정적이지 않고 이성적으로 잘 대화했어요. 이런 자세를 유지하세요!',
        fact_collector_woojin: '\n\n근거 있는 토론이었어! 📊 사실을 바탕으로 대화해서 좋았어. 앞으로도 증거를 중시하며 생각해봐!',
        kind_younghee: '\n\n따뜻한 토론이었어요. 😊 서로 존중하며 대화해서 정말 좋았어요. 앞으로도 이렇게 친절하게 토론해요!'
      };
      
      const closingMessage = closingMessages[debate.character] || closingMessages.tail_question_bora;
      aiContent += closingMessage;
    }

    // Add AI message
    const aiMessage = {
      role: 'ai',
      content: aiContent,
      timestamp: new Date().toISOString()
    };
    messages.push(aiMessage);

    // Save messages
    await kv.set(`debate:${debateId}:messages`, messages);

    // Update debate status - mark as completed if last turn
    debate.status = isLastTurn ? 'completed' : 'in_progress';
    await kv.set(`debate:${debateId}`, debate);

    return c.json({ 
      success: true, 
      message: aiMessage,
      isLastTurn,
      currentTurn: studentMessageCount + 1,
      maxTurns: MAX_TURNS
    });
  } catch (error) {
    console.error('AI chat error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return c.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Save debate reflection
app.post("/make-server-7273e82a/debates/:debateId/reflection", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('Reflection: Unauthorized');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateId = c.req.param('debateId');
    console.log('Saving reflection for debate:', debateId);
    
    const debate = await kv.get(`debate:${debateId}`);
    
    if (!debate || debate.studentId !== user.id) {
      console.log('Debate not found or unauthorized:', { debateId, userId: user.id });
      return c.json({ error: 'Debate not found or unauthorized' }, 404);
    }

    const { mainClaim, aiCounterpoint, improvement, selfRating } = await c.req.json();
    console.log('Reflection data:', { mainClaim, aiCounterpoint, improvement, selfRating });

    const reflection = {
      debateId,
      mainClaim,
      aiCounterpoint,
      improvement,
      selfRating,
      createdAt: new Date().toISOString()
    };

    await kv.set(`debate:${debateId}:reflection`, reflection);
    console.log('Reflection saved successfully');

    // Update debate status to completed
    debate.status = 'completed';
    await kv.set(`debate:${debateId}`, debate);
    console.log('Debate status updated to completed');

    return c.json({ success: true, reflection });
  } catch (error) {
    console.log('Save reflection error:', error);
    return c.json({ error: 'Failed to save reflection' }, 500);
  }
});

// Submit evaluation
app.post("/make-server-7273e82a/debates/:debateId/evaluate", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateId = c.req.param('debateId');
    const debate = await kv.get(`debate:${debateId}`);
    
    if (!debate || debate.studentId !== user.id) {
      return c.json({ error: 'Debate not found or unauthorized' }, 404);
    }

    const { selfScore, selfFeedback } = await c.req.json();

    // Get messages for AI evaluation
    const messages = await kv.get(`debate:${debateId}:messages`) || [];
    const preparation = await kv.get(`debate:${debateId}:preparation`) || {};

    // Calculate AI score based on participation
    const studentMessages = messages.filter((m: any) => m.role === 'student');
    const messageCount = studentMessages.length;

    // Build conversation history for AI analysis
    let conversationText = '';
    conversationText += `[토론 주제]\n${debate.topicTitle}\n${debate.topicDescription}\n\n`;
    conversationText += `[학생 입장]\n${debate.position === 'for' ? '찬성' : '반대'}\n\n`;
    conversationText += `[사전 준비]\n`;
    conversationText += `주장: ${preparation.claim || '없음'}\n`;
    conversationText += `근거: ${preparation.evidence || '없음'}\n`;
    conversationText += `예상 반론: ${preparation.counterarguments || '없음'}\n`;
    conversationText += `반론 대응: ${preparation.responses || '없음'}\n\n`;
    conversationText += `[토론 대화 내용]\n`;
    
    messages.forEach((msg: any, idx: number) => {
      const speaker = msg.role === 'student' ? '학생' : 'AI';
      conversationText += `${speaker}: ${msg.content}\n`;
    });

    // Call OpenAI API for detailed evaluation
    let detailedEvaluation;
    try {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        console.error('OPENAI_API_KEY not found in environment variables');
        throw new Error('OPENAI_API_KEY not configured');
      }

      const evaluationPrompt = `당신은 학생 토론을 공정하게 평가하는 교육 전문가입니다. 다음 토론 내용을 면밀히 분석하여 정직한 평가를 제공해주세요.

${conversationText}

[평가 기준 - 반드시 실제 대화 내용을 기반으로 평가하세요]

참여도 (0-100):
- 90점 이상: 5회 이상 발언, 각 발언이 2문장 이상, 상대 의견에 직접 반응
- 70-89점: 3-4회 발언, 의견 표현 시도
- 50-69점: 1-2회 발언 또는 짧은 응답만
- 49점 이하: 의미없는 단답, 주제 무관한 발언, 참여 거부

논리력 (0-100):
- 90점 이상: 주장-근거-예시 구조 명확, 반론에 논리적 대응
- 70-89점: 주장은 있으나 근거가 약함
- 50-69점: 주장만 있고 근거 없음
- 49점 이하: 주제와 무관한 발언, 논리 없음

근거력 (0-100):
- 90점 이상: 구체적 사례, 통계, 전문가 의견 등 인용
- 70-89점: 일반적 경험이나 상식 수준의 근거
- 50-69점: 막연한 주장만
- 49점 이하: 근거 없음 또는 엉뚱한 내용

총평: 실제 토론 내용을 언급하며 현실적인 피드백을 작성하세요. 잘했으면 칭찬, 부족하면 솔직하게 말하되 격려도 포함하세요.

잘한 점: 실제 대화에서 구체적인 발언을 인용하여 작성하세요. 잘한 점이 없으면 "토론에 참여하려는 의지를 보여줬어요" 정도만 작성하세요.
개선할 점: 실제 문제점을 구체적으로 지적해주세요.

JSON 형식으로만 응답해주세요:
{
  "participationScore": 점수,
  "logicScore": 점수,
  "evidenceScore": 점수,
  "overallFeedback": "총평 (2-3문장, 실제 토론 내용 반영)",
  "strengths": ["잘한 점 1", "잘한 점 2", "잘한 점 3"],
  "improvements": ["개선할 점 1", "개선할 점 2"]
}`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: evaluationPrompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorText);
        throw new Error(`OpenAI API returned ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const aiResponse = openaiData.choices[0].message.content;
      
      console.log('AI Evaluation Response:', aiResponse);

      // Parse JSON response
      try {
        // Extract JSON from response (handle cases where AI adds extra text)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          detailedEvaluation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        throw parseError;
      }

    } catch (aiError) {
      console.error('AI evaluation error:', aiError);
      // Fallback to simple evaluation
      let baseScore = 50;
      
      // Score based on message count
      if (messageCount >= 10) baseScore += 20;
      else if (messageCount >= 7) baseScore += 15;
      else if (messageCount >= 5) baseScore += 10;
      else if (messageCount >= 3) baseScore += 5;

      // Score based on message quality
      const avgLength = studentMessages.reduce((sum: number, m: any) => sum + m.content.length, 0) / (messageCount || 1);
      if (avgLength > 100) baseScore += 15;
      else if (avgLength > 50) baseScore += 10;
      else if (avgLength > 20) baseScore += 5;

      // Score based on preparation
      if (preparation.claim && preparation.evidence) baseScore += 10;
      if (preparation.counterarguments && preparation.responses) baseScore += 5;

      baseScore = Math.min(100, Math.max(0, baseScore));

      // 실제 발언 품질 분석
      const hasSubstantiveContent = avgLength > 30 && messageCount >= 3;

      const feedbackMsg = baseScore >= 80
        ? `총 ${messageCount}개의 발언으로 적극적으로 참여했습니다. 논리적인 주장을 펼치려고 노력한 모습이 인상적이에요. 더 구체적인 근거를 추가하면 훨씬 설득력 있는 토론이 될 거예요!`
        : baseScore >= 60
        ? `총 ${messageCount}개의 발언으로 토론에 참여했습니다. 의견을 표현하려는 시도는 좋았지만, 주장을 뒷받침할 근거가 조금 부족했어요. 다음에는 구체적인 예시나 사례를 준비해보세요.`
        : baseScore >= 40
        ? `총 ${messageCount}개의 발언이 있었지만, 토론 주제에 맞는 체계적인 주장이 부족했습니다. 토론 전에 자신의 입장과 근거를 미리 정리하면 훨씬 나은 토론을 할 수 있어요.`
        : `토론 참여가 매우 미흡했습니다. 의미 있는 주장이나 근거 없이 토론을 마쳤어요. 다음에는 토론 주제를 충분히 생각하고 자신의 입장을 논리적으로 설명해보세요.`;

      detailedEvaluation = {
        participationScore: baseScore,
        logicScore: Math.max(0, hasSubstantiveContent ? baseScore - 5 : Math.min(baseScore, 35)),
        evidenceScore: Math.max(0, hasSubstantiveContent ? baseScore - 8 : Math.min(baseScore, 30)),
        overallFeedback: feedbackMsg,
        strengths: hasSubstantiveContent ? [
          '토론에 여러 차례 발언하며 참여 의지를 보여줬어요',
          '상대방의 의견을 들으며 토론 흐름을 이어갔어요',
          messageCount >= 5 ? '지속적으로 발언하며 토론을 이어갔어요' : '토론에 참여하려는 노력을 보여줬어요'
        ] : [
          '토론에 참여하려는 의지를 보여줬어요'
        ],
        improvements: hasSubstantiveContent ? [
          '주장을 뒷받침할 구체적인 근거(사례, 통계, 경험)를 준비해보세요',
          '상대방의 주장에 대해 직접적으로 반론을 제기해보세요'
        ] : [
          '토론 전 자신의 주장과 근거를 미리 정리해보세요',
          '단순한 동의나 짧은 응답보다 논리적인 주장을 펼쳐보세요',
          '토론 주제에 집중하여 관련 내용으로만 발언해보세요'
        ]
      };
    }

    const evaluation = {
      debateId,
      selfScore,
      selfFeedback,
      participationScore: detailedEvaluation.participationScore,
      logicScore: detailedEvaluation.logicScore,
      evidenceScore: detailedEvaluation.evidenceScore,
      overallFeedback: detailedEvaluation.overallFeedback,
      strengths: detailedEvaluation.strengths,
      improvements: detailedEvaluation.improvements,
      messageCount,
      createdAt: new Date().toISOString()
    };

    await kv.set(`debate:${debateId}:evaluation`, evaluation);

    // Update debate status
    debate.status = 'completed';
    await kv.set(`debate:${debateId}`, debate);

    return c.json({ success: true, evaluation });
  } catch (error) {
    console.log('Evaluate debate error:', error);
    return c.json({ error: 'Failed to evaluate debate' }, 500);
  }
});

// Get student's debates
app.get("/make-server-7273e82a/my-debates", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const debateIds = await kv.get(`student:${user.id}:debates`) || [];
    const debates = await kv.mget(debateIds.map((id: string) => `debate:${id}`));

    return c.json({ debates: debates.filter(Boolean) });
  } catch (error) {
    console.log('Get debates error:', error);
    return c.json({ error: 'Failed to get debates' }, 500);
  }
});

// Issue coupon (teacher only)
app.post("/make-server-7273e82a/coupons", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'teacher') {
      return c.json({ error: 'Only teachers can issue coupons' }, 403);
    }

    const { classId, studentId, message } = await c.req.json();

    const couponId = crypto.randomUUID();
    const coupon = {
      id: couponId,
      classId,
      studentId,
      teacherId: user.id,
      message,
      createdAt: new Date().toISOString()
    };

    await kv.set(`coupon:${couponId}`, coupon);

    // Add to student's coupons
    const studentCoupons = await kv.get(`student:${studentId}:coupons`) || [];
    studentCoupons.push(couponId);
    await kv.set(`student:${studentId}:coupons`, studentCoupons);

    return c.json({ success: true, coupon });
  } catch (error) {
    console.log('Issue coupon error:', error);
    return c.json({ error: 'Failed to issue coupon' }, 500);
  }
});

// Issue coupons to multiple students (teacher only)
app.post("/make-server-7273e82a/coupons/issue", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'teacher') {
      return c.json({ error: 'Only teachers can issue coupons' }, 403);
    }

    const { classId, couponType, studentIds, customName, customDescription } = await c.req.json();

    console.log('Issue coupons request:', {
      teacherId: user.id,
      classId,
      couponType,
      studentIds,
      studentCount: studentIds?.length,
      customName,
      customDescription
    });

    if (!classId || !couponType || !studentIds || studentIds.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate custom coupon fields if custom type
    if (couponType === 'custom' && (!customName || !customDescription)) {
      return c.json({ error: 'Custom coupon requires name and description' }, 400);
    }

    const issuedCoupons = [];

    // Issue coupon to each selected student
    for (const studentId of studentIds) {
      const couponId = crypto.randomUUID();
      const coupon = {
        id: couponId,
        classId,
        studentId,
        teacherId: user.id,
        couponType,
        customName: couponType === 'custom' ? customName : undefined,
        customDescription: couponType === 'custom' ? customDescription : undefined,
        createdAt: new Date().toISOString(),
        used: false
      };

      console.log('Creating coupon:', {
        couponId,
        studentId,
        couponType,
        key: `coupon:${couponId}`
      });

      await kv.set(`coupon:${couponId}`, coupon);

      // Add to student's coupons
      const studentCouponsKey = `student:${studentId}:coupons`;
      const studentCoupons = await kv.get(studentCouponsKey) || [];
      
      console.log('Student coupons before:', {
        studentId,
        key: studentCouponsKey,
        existingCoupons: studentCoupons,
        count: studentCoupons.length
      });

      studentCoupons.push(couponId);
      await kv.set(studentCouponsKey, studentCoupons);

      const updatedCoupons = await kv.get(studentCouponsKey);
      console.log('Student coupons after:', {
        studentId,
        key: studentCouponsKey,
        updatedCoupons,
        count: updatedCoupons?.length
      });

      issuedCoupons.push(coupon);
    }

    console.log(`Successfully issued ${issuedCoupons.length} coupons of type ${couponType} by teacher ${user.id}`);

    return c.json({ success: true, coupons: issuedCoupons });
  } catch (error) {
    console.log('Issue coupons error:', error);
    return c.json({ error: 'Failed to issue coupons' }, 500);
  }
});

// Get student's coupons
app.get("/make-server-7273e82a/my-coupons", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const couponIdsKey = `student:${user.id}:coupons`;
    const couponIds = await kv.get(couponIdsKey) || [];
    
    console.log('Fetching student coupons:', {
      studentId: user.id,
      key: couponIdsKey,
      couponIds,
      count: couponIds.length
    });

    const coupons = await kv.mget(couponIds.map((id: string) => `coupon:${id}`));
    const validCoupons = coupons.filter(Boolean);

    console.log('Retrieved coupons:', {
      studentId: user.id,
      requestedCount: couponIds.length,
      retrievedCount: validCoupons.length,
      coupons: validCoupons
    });

    return c.json({ coupons: validCoupons });
  } catch (error) {
    console.log('Get coupons error:', error);
    return c.json({ error: 'Failed to get coupons' }, 500);
  }
});

// Use coupon
app.post("/make-server-7273e82a/coupons/:couponId/use", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const couponId = c.req.param('couponId');
    const coupon = await kv.get(`coupon:${couponId}`);

    if (!coupon) {
      return c.json({ error: 'Coupon not found' }, 404);
    }

    if (coupon.studentId !== user.id) {
      return c.json({ error: 'Unauthorized to use this coupon' }, 403);
    }

    if (coupon.used) {
      return c.json({ error: 'Coupon already used' }, 400);
    }

    // Mark coupon as used
    const updatedCoupon = {
      ...coupon,
      used: true,
      usedAt: new Date().toISOString()
    };

    await kv.set(`coupon:${couponId}`, updatedCoupon);

    console.log('Coupon used successfully:', {
      couponId,
      studentId: user.id,
      usedAt: updatedCoupon.usedAt
    });

    return c.json({ coupon: updatedCoupon });
  } catch (error) {
    console.log('Use coupon error:', error);
    return c.json({ error: 'Failed to use coupon' }, 500);
  }
});

// Get teacher's issued coupons
app.get("/make-server-7273e82a/coupons/issued", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'teacher') {
      return c.json({ error: 'Only teachers can view issued coupons' }, 403);
    }

    // Get all coupons with teacher's ID
    const allCoupons = await kv.getByPrefix('coupon:');
    const teacherCoupons = allCoupons.filter((coupon: any) => coupon.teacherId === user.id);

    // Enrich with student information
    const enrichedCoupons = await Promise.all(
      teacherCoupons.map(async (coupon: any) => {
        const student = await kv.get(`user:${coupon.studentId}`);
        return {
          ...coupon,
          studentName: student?.name || 'Unknown',
          studentEmail: student?.email || ''
        };
      })
    );

    // Sort by creation date (newest first)
    enrichedCoupons.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`Teacher ${user.id} retrieved ${enrichedCoupons.length} issued coupons`);

    return c.json({ coupons: enrichedCoupons });
  } catch (error) {
    console.log('Get issued coupons error:', error);
    return c.json({ error: 'Failed to get issued coupons' }, 500);
  }
});

// Get student's classes
app.get("/make-server-7273e82a/my-classes", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classIds = await kv.get(`student:${user.id}:classes`) || [];
    const classes = await kv.mget(classIds.map((id: string) => `class:${id}`));

    return c.json({ classes: classes.filter(Boolean) });
  } catch (error) {
    console.log('Get classes error:', error);
    return c.json({ error: 'Failed to get classes' }, 500);
  }
});

// AI Generate Topic
app.post("/make-server-7273e82a/ai/generate-topic", async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ error: 'OPENAI_API_KEY not configured' }, 500);
    }

    // Call OpenAI API to generate topic
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 교육 전문가입니다. 학생들을 위한 토론 주제를 생성해주세요. 응답은 반드시 JSON 형식으로 해주세요: {"title": "주제 제목", "description": "주제 설명"}'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error:', errorText);
      return c.json({ error: 'AI topic generation failed' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    let topicData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        topicData = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a simple topic
        topicData = {
          title: content.split('\n')[0].substring(0, 100),
          description: content.substring(0, 300)
        };
      }
    } catch (e) {
      // Fallback if parsing fails
      topicData = {
        title: '생성된 토론 주제',
        description: content.substring(0, 300)
      };
    }

    return c.json(topicData);
  } catch (error) {
    console.log('Generate topic error:', error);
    return c.json({ error: 'Failed to generate topic' }, 500);
  }
});

// AI Generate Help for debate preparation
app.post("/make-server-7273e82a/ai/generate-help", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('AI generate-help: Unauthorized');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { prompt, section, topic, position } = await c.req.json();
    console.log('AI generate-help request:', { section, topic, position, userId: user.id });

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.log('OPENAI_API_KEY not configured');
      return c.json({ error: 'OPENAI_API_KEY not configured' }, 500);
    }

    // Call OpenAI API to generate help
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 학생들의 토론 준비를 돕는 교육 전문가입니다. 요청받은 내용을 명확하고 간결하게 한 문장으로 작성해주세요. 불필요한 설명 없이 요청받은 문장만 제공하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error:', errorText);
      return c.json({ error: 'AI help generation failed' }, 500);
    }

    const data = await response.json();
    const suggestion = data.choices[0].message.content.trim();
    console.log('AI generated suggestion:', suggestion);

    return c.json({ suggestion });
  } catch (error) {
    console.log('Generate help error:', error);
    return c.json({ error: 'Failed to generate help' }, 500);
  }
});

// Add single student to class
app.post("/make-server-7273e82a/classes/:classId/students", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('Unauthorized: no user');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    console.log('Adding student to class:', classId);
    
    const classData = await kv.get(`class:${classId}`);
    console.log('Class data:', classData);
    
    if (!classData || classData.teacherId !== user.id) {
      console.log('Class not found or unauthorized:', { classData, userId: user.id });
      return c.json({ error: 'Class not found or unauthorized' }, 403);
    }

    const { name } = await c.req.json();
    if (!name) {
      console.log('Student name is required');
      return c.json({ error: 'Student name is required' }, 400);
    }

    console.log('Creating student:', name);

    // Generate email automatically with valid domain
    const classCode = classData.classCode || classData.code || 'DEFAULT';
    const sanitizedName = name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const email = `${classCode.toLowerCase()}.${sanitizedName}.${Date.now()}@student.aidebate.app`;
    
    // Use class code as password for simple login
    const password = classCode;

    const supabase = getSupabaseAdmin();
    
    try {
      // Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, role: 'student' },
        email_confirm: true
      });

      if (authError) {
        console.log(`Failed to create student ${name}:`, authError);
        return c.json({ error: 'Failed to create student: ' + authError.message }, 500);
      }

      const studentId = authData.user.id;
      console.log('Student user created:', studentId);

      // Store user data
      await kv.set(`user:${studentId}`, {
        id: studentId,
        email,
        name,
        role: 'student',
        classCode: classCode,
        createdAt: new Date().toISOString()
      });

      // Store username mapping for login
      await kv.set(`studentlogin:${name}:${classCode}`, {
        userId: studentId,
        email
      });

      // Add student to class
      const classStudents = await kv.get(`class:${classId}:students`) || [];
      if (!classStudents.includes(studentId)) {
        classStudents.push(studentId);
        await kv.set(`class:${classId}:students`, classStudents);
      }

      // Add class to student's classes
      const studentClasses = await kv.get(`student:${studentId}:classes`) || [];
      if (!studentClasses.includes(classId)) {
        studentClasses.push(classId);
        await kv.set(`student:${studentId}:classes`, studentClasses);
      }

      const studentData = {
        id: studentId,
        name,
        email,
        debatesCount: 0,
        averageScore: 0
      };

      console.log('Student added successfully:', studentData);
      return c.json({ success: true, student: studentData });
    } catch (innerError) {
      console.log('Error creating student:', innerError);
      return c.json({ error: 'Failed to create student: ' + (innerError as Error).message }, 500);
    }
  } catch (error) {
    console.log('Add student error:', error);
    return c.json({ error: 'Failed to add student: ' + (error as Error).message }, 500);
  }
});

// Bulk add students to class
app.post("/make-server-7273e82a/classes/:classId/students/bulk", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const classData = await kv.get(`class:${classId}`);
    
    if (!classData || classData.teacherId !== user.id) {
      return c.json({ error: 'Class not found or unauthorized' }, 403);
    }

    const { students } = await c.req.json();
    if (!Array.isArray(students) || students.length === 0) {
      return c.json({ error: 'Invalid students data' }, 400);
    }

    const classCode = classData.classCode || classData.code || 'DEFAULT';
    const supabase = getSupabaseAdmin();
    const createdStudents = [];

    for (const student of students) {
      const { name } = student;
      
      // Generate valid email for each student
      const sanitizedName = name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const email = `${classCode.toLowerCase()}.${sanitizedName}.${Date.now()}@student.aidebate.app`;
      
      // Use class code as password for simple login
      const password = classCode;
      
      try {
        // Create Supabase user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, role: 'student' },
          email_confirm: true
        });

        if (authError) {
          console.log(`Failed to create student ${name}:`, authError);
          continue;
        }

        const studentId = authData.user.id;

        // Store user data
        await kv.set(`user:${studentId}`, {
          id: studentId,
          email,
          name,
          role: 'student',
          classCode: classCode,
          createdAt: new Date().toISOString()
        });

        // Store username mapping for login
        await kv.set(`studentlogin:${name}:${classCode}`, {
          userId: studentId,
          email
        });

        // Add student to class
        const classStudents = await kv.get(`class:${classId}:students`) || [];
        if (!classStudents.includes(studentId)) {
          classStudents.push(studentId);
          await kv.set(`class:${classId}:students`, classStudents);
        }

        // Add class to student's classes
        const studentClasses = await kv.get(`student:${studentId}:classes`) || [];
        if (!studentClasses.includes(classId)) {
          studentClasses.push(classId);
          await kv.set(`student:${studentId}:classes`, studentClasses);
        }

        createdStudents.push({
          id: studentId,
          name,
          email,
          debatesCount: 0,
          averageScore: 0
        });
      } catch (err) {
        console.log(`Error creating student ${name}:`, err);
      }
    }

    return c.json({ 
      success: true, 
      students: createdStudents,
      message: `${createdStudents.length}명의 학생이 추가되었습니다.`
    });
  } catch (error) {
    console.log('Bulk add students error:', error);
    return c.json({ error: 'Failed to add students' }, 500);
  }
});

// Get student debates (for teacher viewing student progress)
app.get("/make-server-7273e82a/students/:studentId/debates", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('Unauthorized: no user');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentId = c.req.param('studentId');
    console.log('Fetching debates for student:', studentId);

    // Verify access (teacher can view their students, students can view their own)
    if (user.role === 'teacher') {
      // Check if student is in one of teacher's classes
      const teacherClasses = await kv.get(`teacher:${user.id}:classes`) || [];
      let hasAccess = false;
      
      for (const classId of teacherClasses) {
        const classStudents = await kv.get(`class:${classId}:students`) || [];
        if (classStudents.includes(studentId)) {
          hasAccess = true;
          break;
        }
      }
      
      if (!hasAccess) {
        console.log('Teacher does not have access to this student');
        return c.json({ error: 'Unauthorized' }, 403);
      }
    } else if (user.role === 'student') {
      // Students can only view their own debates
      if (user.id !== studentId) {
        console.log('Student can only view their own debates');
        return c.json({ error: 'Unauthorized' }, 403);
      }
    } else {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get student data
    const studentData = await kv.get(`user:${studentId}`);
    if (!studentData) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get all debates for this student
    const debateIds = await kv.get(`student:${studentId}:debates`) || [];
    console.log('Student has debates:', debateIds.length);

    const debates: any[] = [];

    for (const debateId of debateIds) {
      const debate = await kv.get(`debate:${debateId}`);
      if (!debate) continue;

      // Only include completed debates
      if (debate.status !== 'completed') continue;

      const debateInfo: any = {
        id: debateId,
        topic: debate.topic || '토론 주제',
        position: debate.position || 'agree',
        status: debate.status,
        createdAt: debate.createdAt,
        completedAt: debate.completedAt || debate.createdAt,
        turns: debate.messages?.length || 0,
      };

      // Add evaluation data if available
      if (debate.evaluation) {
        debateInfo.score = debate.evaluation.scores?.overall || 0;
        debateInfo.logicScore = debate.evaluation.scores?.logic || 0;
        debateInfo.persuasionScore = debate.evaluation.scores?.persuasion || 0;
        debateInfo.evidenceScore = debate.evaluation.scores?.evidence || 0;
        debateInfo.mannerScore = debate.evaluation.scores?.manner || 0;
        debateInfo.feedback = debate.evaluation.overallFeedback || '';
        debateInfo.strengths = debate.evaluation.strengths || [];
        debateInfo.improvements = debate.evaluation.improvements || [];
      }

      debates.push(debateInfo);
    }

    // Sort by completion date (newest first)
    debates.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    console.log('Returning debates:', debates.length);

    return c.json({
      student: {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email
      },
      debates
    });
  } catch (error) {
    console.log('Get student debates error:', error);
    return c.json({ error: 'Failed to fetch debates' }, 500);
  }
});

// Get teacher dashboard data
app.post("/make-server-7273e82a/teacher/dashboard-data", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized: not a teacher');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { classId, position } = await c.req.json();
    console.log('Fetching dashboard data:', { classId, position });

    // classId가 'all'이거나 없는 경우: 교사의 모든 클래스를 대상으로 처리
    let targetClassIds: string[] = [];
    if (!classId || classId === 'all') {
      targetClassIds = await kv.get(`teacher:${user.id}:classes`) || [];
    } else {
      // 특정 클래스: 해당 클래스가 이 교사의 것인지 검증
      const classData = await kv.get(`class:${classId}`);
      if (!classData || classData.teacherId !== user.id) {
        return c.json({ error: 'Class not found or unauthorized' }, 403);
      }
      targetClassIds = [classId];
    }

    // 교사에게 클래스가 없는 경우 빈 데이터 반환
    if (targetClassIds.length === 0) {
      return c.json({
        students: [],
        totalDebates: 0,
        avgScore: 0,
        activeStudents: 0,
        totalStudents: 0,
        avgTurns: 0,
        trendData: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return { name: `${d.getMonth() + 1}/${d.getDate()}`, debates: 0, participation: 0 };
        }),
        scoreDistribution: [
          { name: '0-60점', value: 0, color: '#FF6B6B' },
          { name: '60-80점', value: 0, color: '#FFD93D' },
          { name: '80-100점', value: 0, color: '#6BCB77' }
        ],
        radarData: [
          { subject: '논리성', score: 0, fullMark: 5 },
          { subject: '근거 사용', score: 0, fullMark: 5 },
          { subject: '주제 충실도', score: 0, fullMark: 5 },
          { subject: '토론 예절', score: 0, fullMark: 5 },
          { subject: '비판적 사고', score: 0, fullMark: 5 }
        ]
      });
    }

    // 모든 대상 클래스의 학생 ID를 중복 없이 수집
    const studentIdSet = new Set<string>();
    for (const cid of targetClassIds) {
      const ids: string[] = await kv.get(`class:${cid}:students`) || [];
      ids.forEach((id: string) => studentIdSet.add(id));
    }
    const studentIds = Array.from(studentIdSet);
    console.log('Students in class:', studentIds.length);

    const students: any[] = [];
    let totalDebates = 0;
    let totalTurns = 0;
    let completedDebatesCount = 0;
    const debatesByDate: { [key: string]: number } = {};
    const scoreDistribution = { low: 0, medium: 0, high: 0 };
    const radarData: any[] = [];

    // Collect data for each student
    for (const studentId of studentIds) {
      const studentData = await kv.get(`user:${studentId}`);
      if (!studentData) continue;

      const debates = await kv.get(`student:${studentId}:debates`) || [];
      totalDebates += debates.length;

      let studentCompletedDebates = 0;
      let studentTotalScore = 0;
      let studentTotalTurns = 0;
      let lastDebateDate = null;

      for (const debateId of debates) {
        const debate = await kv.get(`debate:${debateId}`);
        if (!debate) continue;

        // Filter by position if specified
        if (position !== 'all' && debate.position !== position) continue;

        if (debate.status === 'completed') {
          studentCompletedDebates++;
          completedDebatesCount++;

          // Count turns
          const turns = debate.messages?.length || 0;
          studentTotalTurns += turns;
          totalTurns += turns;

          // Track debates by date
          const dateKey = new Date(debate.createdAt).toISOString().split('T')[0];
          debatesByDate[dateKey] = (debatesByDate[dateKey] || 0) + 1;

          // Calculate score
          if (debate.evaluation?.scores) {
            const score = debate.evaluation.scores.overall || 0;
            studentTotalScore += score;

            // Score distribution
            if (score < 60) scoreDistribution.low++;
            else if (score < 80) scoreDistribution.medium++;
            else scoreDistribution.high++;

            // Radar chart data (aggregate scores)
            if (radarData.length === 0) {
              radarData.push(
                { subject: '논리성', score: debate.evaluation.scores.logic || 0, fullMark: 5 },
                { subject: '근거 사용', score: debate.evaluation.scores.evidence || 0, fullMark: 5 },
                { subject: '주제 충실도', score: debate.evaluation.scores.relevance || 0, fullMark: 5 },
                { subject: '토론 예절', score: debate.evaluation.scores.manner || 0, fullMark: 5 },
                { subject: '비판적 사고', score: debate.evaluation.scores.critical || 0, fullMark: 5 }
              );
            } else {
              // Average with existing data
              radarData[0].score = (radarData[0].score + (debate.evaluation.scores.logic || 0)) / 2;
              radarData[1].score = (radarData[1].score + (debate.evaluation.scores.evidence || 0)) / 2;
              radarData[2].score = (radarData[2].score + (debate.evaluation.scores.relevance || 0)) / 2;
              radarData[3].score = (radarData[3].score + (debate.evaluation.scores.manner || 0)) / 2;
              radarData[4].score = (radarData[4].score + (debate.evaluation.scores.critical || 0)) / 2;
            }
          }

          lastDebateDate = debate.createdAt;
        }
      }

      // Add student to list
      if (studentCompletedDebates > 0) {
        const avgScore = studentTotalScore / studentCompletedDebates;
        const avgTurns = studentTotalTurns / studentCompletedDebates;

        students.push({
          id: studentId,
          name: studentData.name,
          debates: studentCompletedDebates,
          avgScore: Math.round(avgScore),
          avgTurns: Math.round(avgTurns * 10) / 10,
          lastDebate: lastDebateDate,
          trend: avgScore >= 70 ? 'up' : avgScore >= 50 ? 'stable' : 'down'
        });
      } else {
        // Include students with no completed debates
        students.push({
          id: studentId,
          name: studentData.name,
          debates: 0,
          avgScore: 0,
          avgTurns: 0,
          lastDebate: null,
          trend: 'stable'
        });
      }
    }

    // Sort students by average score
    students.sort((a, b) => b.avgScore - a.avgScore);

    // Prepare trend data (last 7 days)
    const trendData: any[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      trendData.push({
        name: `${month}/${day}`,
        debates: debatesByDate[dateKey] || 0,
        participation: 0 // Could calculate based on unique students
      });
    }

    // Calculate average score
    const avgScore = students.length > 0
      ? students.reduce((sum, s) => sum + s.avgScore, 0) / students.length
      : 0;

    const dashboardData = {
      students,
      totalDebates: completedDebatesCount,
      avgScore: Math.round(avgScore),
      activeStudents: students.filter(s => s.debates > 0).length,
      totalStudents: students.length,
      avgTurns: completedDebatesCount > 0 ? Math.round((totalTurns / completedDebatesCount) * 10) / 10 : 0,
      trendData,
      scoreDistribution: [
        { name: '0-60점', value: scoreDistribution.low, color: '#FF6B6B' },
        { name: '60-80점', value: scoreDistribution.medium, color: '#FFD93D' },
        { name: '80-100점', value: scoreDistribution.high, color: '#6BCB77' }
      ],
      radarData: radarData.length > 0 ? radarData : [
        { subject: '논리성', score: 0, fullMark: 5 },
        { subject: '근거 사용', score: 0, fullMark: 5 },
        { subject: '주제 충실도', score: 0, fullMark: 5 },
        { subject: '토론 예절', score: 0, fullMark: 5 },
        { subject: '비판적 사고', score: 0, fullMark: 5 }
      ]
    };

    console.log('Dashboard data generated:', {
      students: dashboardData.students.length,
      totalDebates: dashboardData.totalDebates,
      avgScore: dashboardData.avgScore
    });

    return c.json(dashboardData);
  } catch (error) {
    console.log('Dashboard data error:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Get teacher report data
app.get("/make-server-7273e82a/teacher/report", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      console.log('Unauthorized: no user');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data to check role
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'teacher') {
      console.log('Unauthorized: not a teacher', { userId: user.id, role: userData?.role });
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Fetching teacher report for user:', user.id);

    // Get all teacher's classes
    const teacherClasses = await kv.get(`teacher:${user.id}:classes`) || [];
    console.log('Teacher classes:', teacherClasses);

    let totalStudents = 0;
    let totalDebates = 0;
    let totalTurns = 0;
    const studentDebates: any[] = [];
    const topStudents: any[] = [];

    // Aggregate data from all classes
    for (const classId of teacherClasses) {
      const classData = await kv.get(`class:${classId}`);
      if (!classData) continue;

      const classStudents = await kv.get(`class:${classId}:students`) || [];
      totalStudents += classStudents.length;

      // Get debates for each student
      for (const studentId of classStudents) {
        const studentData = await kv.get(`user:${studentId}`);
        if (!studentData) continue;

        const debates = await kv.get(`student:${studentId}:debates`) || [];
        totalDebates += debates.length;

        let studentTotalTurns = 0;
        let studentTotalScore = 0;
        let completedDebates = 0;

        for (const debateId of debates) {
          const debate = await kv.get(`debate:${debateId}`);
          if (debate && debate.status === 'completed') {
            completedDebates++;
            const turns = debate.messages?.length || 0;
            studentTotalTurns += turns;
            totalTurns += turns;
            
            if (debate.evaluation?.scores?.overall) {
              studentTotalScore += debate.evaluation.scores.overall;
            }
          }
        }

        if (completedDebates > 0) {
          const avgScore = studentTotalScore / completedDebates;
          const avgTurns = studentTotalTurns / completedDebates;

          studentDebates.push({
            studentId,
            studentName: studentData.name,
            className: classData.name,
            debateCount: completedDebates,
            averageScore: avgScore,
            averageTurns: avgTurns,
            totalTurns: studentTotalTurns
          });

          topStudents.push({
            name: studentData.name,
            className: classData.name,
            score: avgScore,
            debateCount: completedDebates
          });
        }
      }
    }

    // Sort top students by score
    topStudents.sort((a, b) => b.score - a.score);
    const top5Students = topStudents.slice(0, 5);

    // Calculate averages
    const avgTurnsPerDebate = totalDebates > 0 ? totalTurns / totalDebates : 0;
    const avgScore = studentDebates.length > 0 
      ? studentDebates.reduce((sum, s) => sum + s.averageScore, 0) / studentDebates.length 
      : 0;

    // Calculate position ratio
    let forCount = 0;
    let againstCount = 0;
    let totalLogicScore = 0;
    let totalEvidenceScore = 0;
    let totalParticipationScore = 0;
    let evaluationCount = 0;

    for (const classId of teacherClasses) {
      const classStudents = await kv.get(`class:${classId}:students`) || [];
      for (const studentId of classStudents) {
        const debates = await kv.get(`student:${studentId}:debates`) || [];
        for (const debateId of debates) {
          const debate = await kv.get(`debate:${debateId}`);
          if (debate && debate.status === 'completed') {
            if (debate.position === 'for') forCount++;
            else if (debate.position === 'against') againstCount++;

            // Get evaluation scores
            const evaluation = await kv.get(`debate:${debateId}:evaluation`);
            if (evaluation) {
              totalLogicScore += evaluation.logicScore || 0;
              totalEvidenceScore += evaluation.evidenceScore || 0;
              totalParticipationScore += evaluation.participationScore || 0;
              evaluationCount++;
            }
          }
        }
      }
    }

    const totalPositions = forCount + againstCount;
    const forPercentage = totalPositions > 0 ? Math.round((forCount / totalPositions) * 100) : 50;
    const againstPercentage = totalPositions > 0 ? 100 - forPercentage : 50;

    // Calculate average scores (convert from 0-100 to 0-5 scale)
    const avgLogicScore = evaluationCount > 0 ? (totalLogicScore / evaluationCount / 100) * 5 : 4.0;
    const avgEvidenceScore = evaluationCount > 0 ? (totalEvidenceScore / evaluationCount / 100) * 5 : 4.0;
    const avgParticipationScore = evaluationCount > 0 ? (totalParticipationScore / evaluationCount / 100) * 5 : 4.0;

    // Get top topics (mock data for now - would need topic tracking)
    const topTopics = [
      { title: '학교에서 스마트폰 사용 허용', debates: Math.floor(totalDebates * 0.3), avgScore: 82 },
      { title: '숙제 폐지', debates: Math.floor(totalDebates * 0.25), avgScore: 78 },
      { title: '교복 착용 의무화', debates: Math.floor(totalDebates * 0.2), avgScore: 75 }
    ];

    const reportData = {
      period: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      statistics: {
        totalStudents,
        totalDebates,
        averageScore: Math.round(avgScore),
        participationRate: totalStudents > 0 ? Math.round((studentDebates.length / totalStudents) * 100) : 0,
        averageTurns: Math.round(avgTurnsPerDebate * 10) / 10
      },
      averageScores: {
        logic: Math.round(avgLogicScore * 10) / 10,
        evidence: Math.round(avgEvidenceScore * 10) / 10,
        engagement: Math.round(avgParticipationScore * 10) / 10
      },
      topStudents: top5Students.map(s => ({
        name: s.name,
        class: s.className,
        score: Math.round(s.score),
        debates: s.debateCount
      })),
      recentDebates: studentDebates.slice(0, 10).map(d => ({
        date: new Date().toISOString(),
        student: d.studentName,
        class: d.className,
        topic: '환경 보호',
        score: Math.round(d.averageScore),
        turns: d.averageTurns
      })),
      positionRatio: [
        { name: '찬성', value: forPercentage, color: '#22c55e' },
        { name: '반대', value: againstPercentage, color: '#ec4899' }
      ],
      topTopics: topTopics,
      summary: {
        filterCondition: `전체 학급 (${teacherClasses.length}개 반)`,
        mainAchievements: '학생들이 AI와의 1:1 토론을 통해 논리적 사고력과 비판적 사고 능력을 향상시켰습니다.',
        participation: `전체 학생의 ${totalStudents > 0 ? Math.round((studentDebates.length / totalStudents) * 100) : 0}%가 토론에 참여했으며, 평균 ${Math.round(avgTurnsPerDebate * 10) / 10}턴의 토론이 이루어졌습니다.`
      }
    };

    console.log('Report data generated:', reportData);
    return c.json(reportData);
  } catch (error) {
    console.log('Teacher report error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Initialize test data (for development/testing)
app.post("/make-server-7273e82a/init-test-data", async (c) => {
  try {
    console.log('Initializing test data...');
    const supabase = getSupabaseAdmin();

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase.auth.admin.listUsers();
    const teacherExists = existingTeacher?.users?.some(u => u.email === 'teacher@test.com');

    let teacherId;
    
    if (!teacherExists) {
      // Create test teacher account
      const { data: teacherData, error: teacherError } = await supabase.auth.admin.createUser({
        email: 'teacher@test.com',
        password: '123456',
        user_metadata: { name: '김선생', role: 'teacher' },
        email_confirm: true
      });

      if (teacherError) {
        console.log('Teacher creation error:', teacherError);
        return c.json({ error: 'Failed to create test teacher' }, 500);
      }

      teacherId = teacherData.user.id;
      console.log('Test teacher created:', teacherId);

      // Store teacher data
      await kv.set(`user:${teacherId}`, {
        id: teacherId,
        email: 'teacher@test.com',
        name: '김선생',
        role: 'teacher',
        createdAt: new Date().toISOString()
      });
    } else {
      // Get existing teacher ID
      const existingTeacherUser = existingTeacher.users.find(u => u.email === 'teacher@test.com');
      teacherId = existingTeacherUser!.id;
      console.log('Test teacher already exists:', teacherId);
    }

    // Check if test class already exists
    const existingClassId = await kv.get('classcode:ABC12');
    
    let classId;
    if (!existingClassId) {
      // Create test class
      classId = crypto.randomUUID();
      const testClass = {
        id: classId,
        name: '3학년 1반',
        classCode: 'ABC12',
        teacherId: teacherId,
        createdAt: new Date().toISOString()
      };

      await kv.set(`class:${classId}`, testClass);
      await kv.set('classcode:ABC12', classId);

      // Add class to teacher's classes
      const teacherClasses = await kv.get(`teacher:${teacherId}:classes`) || [];
      if (!teacherClasses.includes(classId)) {
        teacherClasses.push(classId);
        await kv.set(`teacher:${teacherId}:classes`, teacherClasses);
      }

      console.log('Test class created:', classId);
    } else {
      classId = existingClassId;
      console.log('Test class already exists:', classId);
    }

    // Check if test student already exists
    const existingStudentLogin = await kv.get('studentlogin:김철수:ABC12');
    
    if (!existingStudentLogin) {
      // Create test student (김철수)
      const { data: studentData, error: studentError } = await supabase.auth.admin.createUser({
        email: 'kimchulsoo.abc12@student.local',
        password: 'ABC12',
        user_metadata: { name: '김철수', role: 'student' },
        email_confirm: true
      });

      if (studentError) {
        console.log('Student creation error:', studentError);
        return c.json({ error: 'Failed to create test student' }, 500);
      }

      const studentId = studentData.user.id;
      console.log('Test student created:', studentId);

      // Store student data
      await kv.set(`user:${studentId}`, {
        id: studentId,
        email: 'kimchulsoo.abc12@student.local',
        name: '김철수',
        role: 'student',
        classCode: 'ABC12',
        createdAt: new Date().toISOString()
      });

      // Store student login mapping
      await kv.set('studentlogin:김철수:ABC12', {
        userId: studentId,
        email: 'kimchulsoo.abc12@student.local'
      });

      // Add student to class
      const classStudents = await kv.get(`class:${classId}:students`) || [];
      if (!classStudents.includes(studentId)) {
        classStudents.push(studentId);
        await kv.set(`class:${classId}:students`, classStudents);
      }

      // Add class to student's classes
      const studentClasses = await kv.get(`student:${studentId}:classes`) || [];
      if (!studentClasses.includes(classId)) {
        studentClasses.push(classId);
        await kv.set(`student:${studentId}:classes`, studentClasses);
      }

      console.log('Test student added to class');
    } else {
      console.log('Test student already exists');
    }

    console.log('Test data initialization complete!');
    return c.json({ 
      success: true, 
      message: 'Test data initialized',
      credentials: {
        teacher: { email: 'teacher@test.com', password: '123456' },
        student: { name: '김철수', classCode: 'ABC12' }
      }
    });
  } catch (error) {
    console.log('Init test data error:', error);
    return c.json({ error: 'Failed to initialize test data', details: error.message }, 500);
  }
});

// Class settings - Update class info
app.put('/make-server-7273e82a/classes/:classId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const { name } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Class name is required' }, 400);
    }

    const classData = await kv.get(`class:${classId}`);
    if (!classData) {
      return c.json({ error: 'Class not found' }, 404);
    }

    if (classData.teacherId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    classData.name = name;
    classData.updatedAt = new Date().toISOString();
    await kv.set(`class:${classId}`, classData);

    return c.json({ class: classData });
  } catch (error) {
    console.log('Update class error:', error);
    return c.json({ error: 'Failed to update class', details: error.message }, 500);
  }
});

// Class settings - Regenerate class code
app.post('/make-server-7273e82a/classes/:classId/regenerate-code', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const classData = await kv.get(`class:${classId}`);
    
    if (!classData) {
      return c.json({ error: 'Class not found' }, 404);
    }

    if (classData.teacherId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Delete old code mapping
    await kv.del(`classcode:${classData.classCode}`);

    // Generate new code
    const newCode = generateClassCode();
    classData.classCode = newCode;
    classData.updatedAt = new Date().toISOString();
    
    await kv.set(`class:${classId}`, classData);
    await kv.set(`classcode:${newCode}`, classId);

    return c.json({ classCode: newCode });
  } catch (error) {
    console.log('Regenerate class code error:', error);
    return c.json({ error: 'Failed to regenerate class code', details: error.message }, 500);
  }
});

// Class settings - Delete student from class
app.delete('/make-server-7273e82a/classes/:classId/students/:studentId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const studentId = c.req.param('studentId');

    const classData = await kv.get(`class:${classId}`);
    if (!classData) {
      return c.json({ error: 'Class not found' }, 404);
    }

    if (classData.teacherId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Remove student from class
    const classStudents = await kv.get(`class:${classId}:students`) || [];
    const updatedStudents = classStudents.filter(id => id !== studentId);
    await kv.set(`class:${classId}:students`, updatedStudents);

    // Remove class from student's classes
    const studentClasses = await kv.get(`student:${studentId}:classes`) || [];
    const updatedClasses = studentClasses.filter(id => id !== classId);
    await kv.set(`student:${studentId}:classes`, updatedClasses);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete student error:', error);
    return c.json({ error: 'Failed to delete student', details: error.message }, 500);
  }
});

// Class settings - Update class settings
app.put('/make-server-7273e82a/classes/:classId/settings', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const classId = c.req.param('classId');
    const settings = await c.req.json();

    const classData = await kv.get(`class:${classId}`);
    if (!classData) {
      return c.json({ error: 'Class not found' }, 404);
    }

    if (classData.teacherId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.set(`class:${classId}:settings`, settings);

    return c.json({ success: true });
  } catch (error) {
    console.log('Update settings error:', error);
    return c.json({ error: 'Failed to update settings', details: error.message }, 500);
  }
});

// Data export endpoint
app.get('/make-server-7273e82a/teacher/export', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const format = c.req.query('format') || 'csv';
    const type = c.req.query('type') || 'students';
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    // Get teacher's classes
    const teacherClasses = await kv.get(`teacher:${user.id}:classes`) || [];
    
    let data = [];
    
    if (type === 'students') {
      // Export students data
      for (const classId of teacherClasses) {
        const classData = await kv.get(`class:${classId}`);
        const studentIds = await kv.get(`class:${classId}:students`) || [];
        
        for (const studentId of studentIds) {
          const studentData = await kv.get(`user:${studentId}`);
          if (studentData) {
            data.push({
              className: classData.name,
              studentName: studentData.name,
              email: studentData.email,
              joinedDate: studentData.createdAt
            });
          }
        }
      }
    } else if (type === 'debates') {
      // Export debates data
      for (const classId of teacherClasses) {
        const classData = await kv.get(`class:${classId}`);
        const studentIds = await kv.get(`class:${classId}:students`) || [];
        
        for (const studentId of studentIds) {
          const debates = await kv.getByPrefix(`debate:${studentId}:`);
          for (const debate of debates) {
            data.push({
              className: classData.name,
              studentName: debate.studentName,
              topic: debate.topic,
              date: debate.createdAt,
              score: debate.score
            });
          }
        }
      }
    }

    // Generate file content based on format
    let content = '';
    let contentType = 'text/csv';
    let filename = `export-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    if (format === 'csv') {
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        content = headers + '\n' + rows;
      }
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `export-${type}-${new Date().toISOString().split('T')[0]}.json`;
    }

    return c.json({ 
      data: content,
      contentType,
      filename
    });
  } catch (error) {
    console.log('Export error:', error);
    return c.json({ error: 'Failed to export data', details: error.message }, 500);
  }
});

// Support contact endpoint
app.post('/make-server-7273e82a/support/contact', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email, subject, message, category } = await c.req.json();

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Store contact message
    const contactId = crypto.randomUUID();
    const contactData = {
      id: contactId,
      userId: user.id,
      name,
      email,
      subject,
      message,
      category: category || 'general',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`contact:${contactId}`, contactData);

    // In a real implementation, this would send an email notification
    console.log('Contact message received:', contactData);

    return c.json({ success: true });
  } catch (error) {
    console.log('Contact submission error:', error);
    return c.json({ error: 'Failed to submit contact', details: error.message }, 500);
  }
});

// ===== 공지사항 엔드포인트 =====

// 교사: 공지사항 작성
app.post('/announcements', async (c) => {
  try {
    const session = await getSession(c);
    if (!session || session.role !== 'teacher') {
      return c.json({ error: 'Teacher auth required' }, 401);
    }

    const body = await c.req.json();
    const { classId, title, content, isPinned } = body;

    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400);
    }

    const announcementId = crypto.randomUUID();
    const now = new Date().toISOString();

    const announcement = {
      id: announcementId,
      teacherId: session.userId,
      teacherName: session.name || '선생님',
      classId: classId || null,
      title,
      content,
      isPinned: isPinned || false,
      createdAt: now,
      updatedAt: now
    };

    await kv.set(`announcement:${announcementId}`, announcement);

    // 교사의 공지사항 목록 인덱스 업데이트
    const teacherAnnouncements = await kv.get(`teacher_announcements:${session.userId}`) || [];
    teacherAnnouncements.unshift(announcementId);
    await kv.set(`teacher_announcements:${session.userId}`, teacherAnnouncements);

    // 특정 학급 공지사항 인덱스 업데이트
    if (classId) {
      const classAnnouncements = await kv.get(`class_announcements:${classId}`) || [];
      classAnnouncements.unshift(announcementId);
      await kv.set(`class_announcements:${classId}`, classAnnouncements);
    } else {
      // 전체 공지 인덱스
      const globalAnnouncements = await kv.get('global_announcements') || [];
      globalAnnouncements.unshift(announcementId);
      await kv.set('global_announcements', globalAnnouncements);
    }

    return c.json({ success: true, announcement });
  } catch (error) {
    console.log('Announcement create error:', error);
    return c.json({ error: 'Failed to create announcement', details: error.message }, 500);
  }
});

// 교사: 자신의 공지사항 목록 조회
app.get('/teacher/announcements', async (c) => {
  try {
    const session = await getSession(c);
    if (!session || session.role !== 'teacher') {
      return c.json({ error: 'Teacher auth required' }, 401);
    }

    const announcementIds = await kv.get(`teacher_announcements:${session.userId}`) || [];
    const announcements = [];

    for (const id of announcementIds) {
      const ann = await kv.get(`announcement:${id}`);
      if (ann) announcements.push(ann);
    }

    return c.json({ announcements });
  } catch (error) {
    console.log('Teacher announcements error:', error);
    return c.json({ error: 'Failed to fetch announcements', details: error.message }, 500);
  }
});

// 교사: 공지사항 삭제
app.delete('/announcements/:id', async (c) => {
  try {
    const session = await getSession(c);
    if (!session || session.role !== 'teacher') {
      return c.json({ error: 'Teacher auth required' }, 401);
    }

    const announcementId = c.req.param('id');
    const ann = await kv.get(`announcement:${announcementId}`);

    if (!ann) {
      return c.json({ error: 'Announcement not found' }, 404);
    }
    if (ann.teacherId !== session.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.delete(`announcement:${announcementId}`);

    // 인덱스에서도 제거
    const teacherAnns = await kv.get(`teacher_announcements:${session.userId}`) || [];
    await kv.set(`teacher_announcements:${session.userId}`, teacherAnns.filter((id: string) => id !== announcementId));

    if (ann.classId) {
      const classAnns = await kv.get(`class_announcements:${ann.classId}`) || [];
      await kv.set(`class_announcements:${ann.classId}`, classAnns.filter((id: string) => id !== announcementId));
    } else {
      const globalAnns = await kv.get('global_announcements') || [];
      await kv.set('global_announcements', globalAnns.filter((id: string) => id !== announcementId));
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Announcement delete error:', error);
    return c.json({ error: 'Failed to delete announcement', details: error.message }, 500);
  }
});

// 학생: 내가 속한 학급의 공지사항 조회
app.get('/student/announcements', async (c) => {
  try {
    const session = await getSession(c);
    if (!session) {
      return c.json({ error: 'Auth required' }, 401);
    }

    // 학생의 학급 정보 조회
    const studentClasses = await kv.get(`student_classes:${session.userId}`) || [];
    const announcements: any[] = [];
    const seen = new Set<string>();

    // 전체 공지
    const globalIds = await kv.get('global_announcements') || [];
    for (const id of globalIds) {
      if (!seen.has(id)) {
        const ann = await kv.get(`announcement:${id}`);
        if (ann) {
          announcements.push(ann);
          seen.add(id);
        }
      }
    }

    // 소속 학급 공지
    for (const classId of studentClasses) {
      const classIds = await kv.get(`class_announcements:${classId}`) || [];
      for (const id of classIds) {
        if (!seen.has(id)) {
          const ann = await kv.get(`announcement:${id}`);
          if (ann) {
            announcements.push(ann);
            seen.add(id);
          }
        }
      }
    }

    // 최신순 정렬, 고정 공지 먼저
    announcements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 읽음 처리 정보 추가
    const readIds = await kv.get(`student_read_announcements:${session.userId}`) || [];
    const readSet = new Set(readIds);
    const result = announcements.map(ann => ({
      ...ann,
      isRead: readSet.has(ann.id)
    }));

    return c.json({ announcements: result });
  } catch (error) {
    console.log('Student announcements error:', error);
    return c.json({ error: 'Failed to fetch announcements', details: error.message }, 500);
  }
});

// 학생: 공지사항 읽음 처리
app.post('/student/announcements/:id/read', async (c) => {
  try {
    const session = await getSession(c);
    if (!session) {
      return c.json({ error: 'Auth required' }, 401);
    }

    const announcementId = c.req.param('id');
    const readIds = await kv.get(`student_read_announcements:${session.userId}`) || [];
    if (!readIds.includes(announcementId)) {
      readIds.push(announcementId);
      await kv.set(`student_read_announcements:${session.userId}`, readIds);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Announcement read error:', error);
    return c.json({ error: 'Failed to mark as read', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);