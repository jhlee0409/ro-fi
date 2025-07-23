import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GradientText } from "@/components/ui/gradient-text";

interface AdminLoginProps {
  onLogin: (password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function AdminLogin({
  onLogin,
  isLoading = false,
  error,
}: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    await onLogin(password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 떠다니는 파티클들 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* 그라디언트 오브 */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* 메인 로그인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* 로고 애니메이션 */}
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm opacity-50"
              />
              <Sparkles className="w-8 h-8 text-white relative z-10" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                <GradientText
                  colors={["#8B5CF6", "#EC4899", "#6366F1"]}
                  className="text-2xl font-bold"
                >
                  RO-FAN Admin
                </GradientText>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI 로맨스 판타지 관리 시스템
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 에러 메시지 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  관리자 패스워드
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="패스워드를 입력하세요"
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <ShimmerButton
                type="submit"
                className="w-full h-11"
                disabled={!password.trim() || isSubmitting || isLoading}
                shimmerColor="#8B5CF6"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting || isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      인증 중...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      관리자 접근
                    </motion.div>
                  )}
                </AnimatePresence>
              </ShimmerButton>
            </form>

            {/* 보안 알림 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <span className="font-medium">보안 인증</span>
                <br />
                <span className="text-xs">
                  관리자 권한이 필요한 페이지입니다
                </span>
              </div>
            </motion.div>

            {/* 하단 링크 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← 메인 페이지로 돌아가기
                </a>
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* 버전 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 text-xs text-muted-foreground"
        >
          RO-FAN Admin v2.0 | Powered by Claude AI & Astro
        </motion.div>
      </motion.div>
    </div>
  );
}
