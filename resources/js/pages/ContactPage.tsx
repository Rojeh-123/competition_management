import { FormEvent } from "react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { PageHeader, Navbar, Footer } from "@/components/layout";
import { Head, useForm } from "@inertiajs/react";
import { useTranslation } from "@/lib/i18n";

interface ContactForm {
  contact: string;
  subject: string;
  message: string;
  [key: string]: any;
}

function ContactPage() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm<ContactForm>({
    contact: "",
    subject: "",
    message: "",
  });

  const handleChange =
    (field: keyof ContactForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(field, e.target.value);
      };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    post(route("contact.store"), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <>
      <Head title={`${t('contact.title')} – CompeteHub`} />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader title={t('contact.title')} description={t('contact.description')} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto items-stretch">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                        <div>
                          <Label>
                            {t('contact.emailOrMobile')}
                          </Label>
                          <Input
                            type="text"
                            placeholder="you@example.com / 01000000000"
                            className="mt-1.5"
                            value={data.contact}
                            onChange={handleChange("contact")}
                          />
                          {errors.contact && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.contact}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>{t('contact.subject')}</Label>
                          <Input
                            type="text"
                            placeholder={t('contact.subjectPlaceholder')}
                            className="mt-1.5"
                            value={data.subject}
                            onChange={handleChange("subject")}
                          />
                          {errors.subject && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.subject}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5">
                        <Label>{t('contact.message')}</Label>
                        <Textarea
                          placeholder={t('contact.messagePlaceholder')}
                          className="mt-1.5 min-h-[120px]"
                          value={data.message}
                          onChange={handleChange("message")}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="cursor-pointer mt-5"
                        disabled={processing}
                      >
                        {processing ? t('contact.sending') : t('contact.sendButton')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 h-full">
                <Card className="h-full">
                  <CardContent className="pt-6 pb-8 space-y-4">
                    <div className="flex justify-center mb-4">
                      <img
                        src={`/competition_management/public/storage/profile_images/rojeh.jpg`}
                        alt="Rojeh Samy"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <a href="mailto:peposamy59@gmail.com">
                        <p className="text-sm font-medium">{t('contact.email')}</p>
                        <p className="text-sm text-muted-foreground">
                          peposamy59@gmail.com
                        </p>
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <a href="tel:+201220017941">
                        <p className="text-sm font-medium">{t('contact.phone')}</p>
                        <p className="text-sm text-muted-foreground">
                          +20 1220 017 941
                        </p>
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <a
                        href="https://wa.me/201220017941"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p className="text-sm font-medium">{t('contact.whatsapp')}</p>
                        <p className="text-sm text-muted-foreground">
                          +20 1220 017 941
                        </p>
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=El-Shorouk+Cairo+Egypt"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p className="text-sm font-medium">{t('contact.location')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('contact.locationValue')}
                        </p>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default ContactPage;
