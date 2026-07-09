import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const pwdSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must include uppercase').regex(/\d/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PwdData = z.infer<typeof pwdSchema>;

export default function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      address: '',
    },
  });

  const pwdForm = useForm<PwdData>({ resolver: zodResolver(pwdSchema) });

  const saveProfile = async (data: ProfileData) => {
    setSavingProfile(true);
    try {
      const updated = await userService.updateMe(data);
      updateStoredUser({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('Profile updated!');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async ({ currentPassword, newPassword }: PwdData) => {
    setSavingPwd(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed!');
      pwdForm.reset();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Password change failed');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-7 w-7" /> Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input {...profileForm.register('firstName')} aria-invalid={!!profileForm.formState.errors.firstName} />
                    {profileForm.formState.errors.firstName && <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input {...profileForm.register('lastName')} aria-invalid={!!profileForm.formState.errors.lastName} />
                    {profileForm.formState.errors.lastName && <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...profileForm.register('phone')} type="tel" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...profileForm.register('address')} />
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={pwdForm.handleSubmit(savePassword)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" {...pwdForm.register('currentPassword')} aria-invalid={!!pwdForm.formState.errors.currentPassword} />
                  {pwdForm.formState.errors.currentPassword && <p className="text-xs text-destructive">{pwdForm.formState.errors.currentPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" {...pwdForm.register('newPassword')} aria-invalid={!!pwdForm.formState.errors.newPassword} />
                  {pwdForm.formState.errors.newPassword && <p className="text-xs text-destructive">{pwdForm.formState.errors.newPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" {...pwdForm.register('confirmPassword')} aria-invalid={!!pwdForm.formState.errors.confirmPassword} />
                  {pwdForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{pwdForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={savingPwd}>
                  {savingPwd && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
