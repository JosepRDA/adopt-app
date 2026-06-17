import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Report } from "../types";

const REPORTS_COLLECTION = "reports";

// Shape of the data the report form collects
export type ReportInput = Omit<Report, "id" | "status" | "createdAt">;

export async function createReport(reportData: ReportInput): Promise<string> {
  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...reportData,
    status: "open",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// All reports, newest first — used by AdminPanelPage
export async function fetchAllReports(): Promise<Report[]> {
  const q = query(collection(db, REPORTS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Report[];
}

export async function markReportResolved(reportId: string): Promise<void> {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status: "resolved" });
}

export async function dismissReport(reportId: string): Promise<void> {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status: "dismissed" });
}
