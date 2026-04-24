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
import StudentResults from "./pages/StudentResults";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StaffPrompts from "./pages/StaffPrompts";
import StaffLessonEditor from "./pages/StaffLessonEditor";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import AdminCurriculum from "./pages/AdminCurriculum";
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
              { path: "lesson-planner", Component: LessonPlanner },
              { path: "exercise-creator", Component: ExerciseCreator },
              { path: "exam-generator", Component: ExamGenerator },
              { path: "ocr-grading", Component: OCRGrading },
              { path: "question-bank", Component: QuestionBank },
              { path: "student-results", Component: StudentResults },
            ],
          },

          // STAFF only
          {
            Component: () => <RequireRole allowedRoles={["STAFF"]} />,
            children: [
              { path: "staff", Component: StaffDashboard },
              { path: "staff/prompts", Component: StaffPrompts },
              { path: "staff/lesson-editor", Component: StaffLessonEditor },
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
            ],
          },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
