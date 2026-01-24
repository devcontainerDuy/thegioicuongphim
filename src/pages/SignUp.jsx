import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignUp = () => {
  const [loading, setLoading] = React.useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      password: Yup.string().min(6, 'Mật khẩu phải từ 6 ký tự').required('Vui lòng nhập mật khẩu'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp').required('Vui lòng xác nhận mật khẩu'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await register(values.email, values.password, values.username);
        toast.success('Đăng ký thành công!');
        navigate('/');
      } catch (error) {
        toast.error(error.response.data.message || 'Đăng ký thất bại');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center relative p-4 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/5e16108c-c30e-447e-8ea8-aca6c50afc0d/web/VN-en-20230130-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <Card className="w-full max-w-md relative z-10 bg-black/80 border-zinc-800 text-white backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-primary">Đăng Ký</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Tạo tài khoản để trải nghiệm không giới hạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary"
                {...formik.getFieldProps('username')}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-xs">{formik.errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary"
                {...formik.getFieldProps('email')}
              />
               {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary"
                {...formik.getFieldProps('password')}
              />
               {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs">{formik.errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-primary"
                {...formik.getFieldProps('confirmPassword')}
              />
               {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang xử lý..." : "Đăng Ký Ngay"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-zinc-400">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                    Đăng nhập
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
