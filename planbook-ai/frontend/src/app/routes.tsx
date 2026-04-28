import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuestionBank from "./pages/QuestionBank";
import ExerciseCreator from "./pages/ExerciseCreator";
import ExamGenerator from "./pages/ExamGenerator";
import OCRGrading from "./pages/OCRGrading";
import LessonPlanner from "./pages/LessonPlanner";
import TeacherLessonPlans from "./pages/TeacherLessonPlans";
import TeacherExercises from "./pages/TeacherExercises";
import TeacherExams from "./pages/TeacherExams";
import StudentResults from "./pages/StudentResults";
import TeacherPackages from "./pages/TeacherPackages";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StaffPrompts from "./pages/StaffPrompts";
import StaffLessonEditor from "./pages/StaffLessonEditor";
import StaffCurriculum from "./pages/StaffCurriculum";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import AdminCurriculum from "./pages/AdminCurriculum";
import AdminRevenue from "./pages/AdminRevenue";
import AdminSystemConfig from "./pages/AdminSystemConfig";
import UserProfile from "./pages/UserProfile";
import { RequireAuth, RequireRole } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // ---- PUBLIC: Không cần login ----
      { index: true, Component: Login },
      { path: "register", Component: Register },

      // ---- PROTECTED: Cần login ----
      {
        Component: RequireAuth,
        children: [
          { path: "profile", Component: UserProfile },

          // TEACHER only
          {
            Component: () => <RequireRole allowedRoles={["TEACHER"]} />,
            children: [
              { path: "teacher", Component: TeacherDashboard },
              { path: "teacher/lesson-plans", Component: TeacherLessonPlans },
              { path: "teacher/lesson-plans/:id", Component: LessonPlanner },
              { path: "teacher/exercises", Component: TeacherExercises },
              { path: "teacher/exams", Component: TeacherExams },
              { path: "lesson-planner", Component: LessonPlanner },
              { path: "exercise-creator", Component: ExerciseCreator },
              { path: "exam-generator", Component: ExamGenerator },
              { path: "ocr-grading", Component: OCRGrading },
              { path: "student-results", Component: StudentResults },
              { path: "teacher/packages", Component: TeacherPackages },
            ],
          },

          // STAFF only
          {
            Component: () => <RequireRole allowedRoles={["STAFF"]} />,
            children: [
              { path: "staff", Component: StaffDashboard },
              { path: "staff/question-bank", Component: QuestionBank },
              { path: "staff/prompts", Component: StaffPrompts },
              { path: "staff/lesson-editor", Component: StaffLessonEditor },
              { path: "staff/curriculum", Component: StaffCurriculum },
            ],
          },

          // MANAGER only
          {
            Component: () => <RequireRole allowedRoles={["MANAGER"]} />,
            children: [
              { path: "manager", Component: ManagerDashboard },
            ],
          },

          // ADMIN only
          {
            Component: () => <RequireRole allowedRoles={["ADMIN"]} />,
            children: [
              { path: "admin", Component: AdminDashboard },
              { path: "admin/users", Component: AdminUsers },
              { path: "admin/curriculum", Component: AdminCurriculum },
              { path: "admin/revenue", Component: AdminRevenue },
              { path: "admin/system-config", Component: AdminSystemConfig },
            ],
          },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
